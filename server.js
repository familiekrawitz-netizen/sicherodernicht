const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const path = require('path');

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.join(__dirname, 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const LEGACY_FILE = path.join(DATA_DIR, 'reports.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const COMPANY_ALERT_TYPES = ['gun', 'knife', 'violence', 'mob'];
const FUN_TAGS = ['first_kiss', 'sport_success', 'best_recovery', 'kind_people', 'interesting_area'];
const PUBLIC_SCORES = [1, 2, 3, 4, 5];
const TOKEN_TTL_MS = 1000 * 60 * 60 * 12;
const COMPANY_LOCATION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const PRIVATE_ALERT_AUDIT_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const COMPANY_ALERT_AUDIT_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const PUBLIC_RATING_COOLDOWN_MS = 1000 * 60 * 45;
const ANTI_SPAM_SALT = 'sicherodernicht-privacy-first-v1';
const ADMIN_CODE = String(process.env.ADMIN_CODE || 'peter').trim().toLowerCase();
const ADMIN_PIN = String(process.env.ADMIN_PIN || '97531pk').trim();
const TEST_ACCESS_CODE = String(process.env.TEST_ACCESS_CODE || '').trim();
const TEST_ACCESS_COOKIE = 'sicherodernicht_test_access';
const TEST_ACCESS_TTL_MS = 1000 * 60 * 60 * 24 * 14;

const defaultStore = () => ({
  ratings: [],
  alerts: [],
  alertAudits: [],
  funReports: [],
  sessions: [],
  adminSessions: [],
  cooldowns: [],
  users: [
    {
      id: 'u-private-anna',
      code: 'anna',
      pin: '12345ab',
      role: 'private',
      name: 'Anna Beispiel',
      companyId: null,
      companyName: null,
      lastKnownLocation: null
    },
    {
      id: 'u-company-sven',
      code: 'safeguard1',
      pin: '24680sg',
      role: 'company',
      name: 'Sven Leitstelle',
      companyId: 'company-safeguard',
      companyName: 'SafeGuard',
      lastKnownLocation: null
    },
    {
      id: 'u-company-lina',
      code: 'safeguard2',
      pin: '86420sg',
      role: 'company',
      name: 'Lina Streife',
      companyId: 'company-safeguard',
      companyName: 'SafeGuard',
      lastKnownLocation: null
    },
    {
      id: 'u-company-cem',
      code: 'cityshield',
      pin: '11220cs',
      role: 'company',
      name: 'Cem Einsatz',
      companyId: 'company-cityshield',
      companyName: 'CityShield',
      lastKnownLocation: null
    }
  ],
  companies: [
    {
      id: 'company-safeguard',
      name: 'SafeGuard',
      color: '#0f766e',
      logoText: 'SG'
    },
    {
      id: 'company-cityshield',
      name: 'CityShield',
      color: '#1d4ed8',
      logoText: 'CS'
    },
    {
      id: 'company-nordwacht',
      name: 'NordWacht',
      color: '#b45309',
      logoText: 'NW'
    }
  ],
  emergencyPlaces: [
    {
      id: 'place-police-alex',
      kind: 'police',
      name: 'Polizeiwache Alexanderplatz',
      address: 'Keibelstrasse 35, 10178 Berlin',
      lat: 52.521918,
      lng: 13.413215
    },
    {
      id: 'place-hospital-charite',
      kind: 'hospital',
      name: 'Charite Campus Mitte',
      address: 'Chariteplatz 1, 10117 Berlin',
      lat: 52.525125,
      lng: 13.376665
    },
    {
      id: 'place-police-zoo',
      kind: 'police',
      name: 'Polizei Zoologischer Garten',
      address: 'Rankestrasse 6, 10789 Berlin',
      lat: 52.505103,
      lng: 13.332166
    },
    {
      id: 'place-hospital-neukoelln',
      kind: 'hospital',
      name: 'Vivantes Neukolln',
      address: 'Rudower Strasse 48, 12351 Berlin',
      lat: 52.453019,
      lng: 13.43443
    }
  ],
  places: [
    {
      id: 'preset-alex',
      label: 'Alexanderplatz, Berlin',
      lat: 52.521918,
      lng: 13.413215
    },
    {
      id: 'preset-brandenburger-tor',
      label: 'Brandenburger Tor, Berlin',
      lat: 52.516275,
      lng: 13.377704
    },
    {
      id: 'preset-ostkreuz',
      label: 'Ostkreuz, Berlin',
      lat: 52.50315,
      lng: 13.469011
    },
    {
      id: 'preset-hamburg-hbf',
      label: 'Hauptbahnhof, Hamburg',
      lat: 53.552772,
      lng: 10.006683
    },
    {
      id: 'preset-koeln-dom',
      label: 'Kolner Dom, Koln',
      lat: 50.941278,
      lng: 6.958281
    }
  ]
});

function ensureFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(STORE_FILE)) {
    const seeded = defaultStore();
    if (fs.existsSync(LEGACY_FILE)) {
      try {
        const legacy = JSON.parse(fs.readFileSync(LEGACY_FILE, 'utf8'));
        if (Array.isArray(legacy)) {
          seeded.ratings = legacy
            .map((entry) => ({
              id: entry.id || `legacy-${Date.now()}`,
              cellId: cellIdFor(Number(entry.lat), Number(entry.lng)),
              lat: Number(entry.lat),
              lng: Number(entry.lng),
              score: entry.category === 'safe' ? 1 : entry.category === 'normal' ? 3 : 5,
              createdAt: entry.createdAt || new Date().toISOString(),
              source: 'legacy-import'
            }))
            .filter((entry) => Number.isFinite(entry.lat) && Number.isFinite(entry.lng));
        }
      } catch {}
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(seeded, null, 2), 'utf8');
  }
}

function readStore() {
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return normalizeStore({ ...defaultStore(), ...parsed });
  } catch {
    return defaultStore();
  }
}

function writeStore(store) {
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
}

function alertAuditTtlForRole(role) {
  return role === 'company' ? COMPANY_ALERT_AUDIT_TTL_MS : PRIVATE_ALERT_AUDIT_TTL_MS;
}

function retentionUntilForAlert(createdAt, role) {
  return new Date(new Date(createdAt).getTime() + alertAuditTtlForRole(role)).toISOString();
}

function anonymizedAlert(entry) {
  return {
    id: entry.id,
    lat: entry.lat,
    lng: entry.lng,
    score: 6,
    alertType: entry.alertType || 'general',
    note: entry.note || '',
    createdAt: entry.createdAt || new Date().toISOString(),
    source: 'registered_alert_anonymized'
  };
}

function buildAlertAudit({ alertId, createdAt, lat, lng, alertType, note, user, company }) {
  return {
    id: `audit-${alertId}`,
    alertId,
    createdAt,
    retentionUntil: retentionUntilForAlert(createdAt, user.role),
    lat,
    lng,
    alertType: alertType || 'general',
    note: note || '',
    reporter: {
      id: user.id,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
      companyName: user.companyName
    },
    companyLogo: company
      ? {
          text: company.logoText,
          color: company.color,
          name: company.name
        }
      : null
  };
}

function auditFromAlert(entry) {
  if (!entry.reporter) return null;
  return {
    id: `audit-${entry.id}`,
    alertId: entry.id,
    createdAt: entry.createdAt || new Date().toISOString(),
    retentionUntil: retentionUntilForAlert(entry.createdAt || new Date().toISOString(), entry.reporter.role),
    lat: entry.lat,
    lng: entry.lng,
    alertType: entry.alertType || 'general',
    note: entry.note || '',
    reporter: entry.reporter,
    companyLogo: entry.companyLogo || null
  };
}

function normalizeStore(store) {
  store.alertAudits = Array.isArray(store.alertAudits) ? store.alertAudits : [];
  const migratedAudits = [];
  store.alerts = (store.alerts || []).map((entry) => {
    const audit = auditFromAlert(entry);
    if (audit && !store.alertAudits.some((existing) => existing.alertId === audit.alertId)) {
      migratedAudits.push(audit);
    }
    return anonymizedAlert(entry);
  });
  store.alertAudits = [...store.alertAudits, ...migratedAudits];
  pruneStore(store);
  return store;
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Permissions-Policy': 'geolocation=(self)',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, payload, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Permissions-Policy': 'geolocation=(self)',
    'Cache-Control': 'no-store'
  });
  res.end(payload);
}

function sendText(res, statusCode, text) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Permissions-Policy': 'geolocation=(self)',
    'Cache-Control': 'no-store'
  });
  res.end(text);
}

function parseCookies(req) {
  return String(req.headers.cookie || '')
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const index = part.indexOf('=');
      if (index === -1) return cookies;
      cookies[decodeURIComponent(part.slice(0, index))] = decodeURIComponent(part.slice(index + 1));
      return cookies;
    }, {});
}

function testAccessToken() {
  return crypto.createHash('sha256').update(`${TEST_ACCESS_CODE}:${ANTI_SPAM_SALT}`).digest('hex');
}

function hasTestAccess(req) {
  if (!TEST_ACCESS_CODE) return true;
  return parseCookies(req)[TEST_ACCESS_COOKIE] === testAccessToken();
}

function testAccessCookie(req) {
  const secure = req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
  return `${TEST_ACCESS_COOKIE}=${encodeURIComponent(testAccessToken())}; Max-Age=${Math.floor(TEST_ACCESS_TTL_MS / 1000)}; Path=/; HttpOnly; SameSite=Lax${secure}`;
}

function wantsHtml(req, url) {
  if (url.pathname === '/' || url.pathname.endsWith('.html')) return true;
  return String(req.headers.accept || '').includes('text/html');
}

function sendTestAccessPage(res) {
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Permissions-Policy': 'geolocation=(self)',
    'Cache-Control': 'no-store'
  });
  res.end(`<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>sicherodernicht Testzugang</title>
  <style>
    :root { color-scheme: light; font-family: "Avenir Next", "Segoe UI", sans-serif; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: radial-gradient(circle at 20% 10%, #d9f99d 0, transparent 28%), linear-gradient(135deg, #eff6ff, #fff7ed 58%, #ecfeff); color: #12201a; }
    main { width: min(92vw, 440px); padding: 30px; border-radius: 30px; background: rgba(255,255,255,.82); box-shadow: 0 24px 80px rgba(15, 23, 42, .16); border: 1px solid rgba(255,255,255,.85); backdrop-filter: blur(18px); }
    h1 { margin: 0 0 10px; font-size: clamp(2rem, 8vw, 3.2rem); letter-spacing: -.06em; }
    p { margin: 0 0 22px; color: #475569; line-height: 1.5; }
    label { display: grid; gap: 8px; font-weight: 800; color: #1f2937; }
    input { min-height: 50px; border: 1px solid #cbd5e1; border-radius: 16px; padding: 0 16px; font-size: 1.05rem; background: #fff; }
    button { width: 100%; min-height: 52px; margin-top: 14px; border: 0; border-radius: 17px; background: linear-gradient(135deg, #0f766e, #2563eb); color: white; font-weight: 900; font-size: 1rem; cursor: pointer; box-shadow: 0 14px 28px rgba(37,99,235,.2); }
    button:active { transform: translateY(1px) scale(.99); }
    .error { min-height: 22px; margin-top: 12px; color: #b91c1c; font-weight: 800; }
    .hint { margin-top: 18px; font-size: .9rem; color: #64748b; }
  </style>
</head>
<body>
  <main>
    <h1>sicherodernicht</h1>
    <p>Diese Version ist noch in der Testphase. Bitte gib den Testcode ein, den du vom Betreiber erhalten hast.</p>
    <form id="testAccessForm">
      <label>Testcode
        <input id="testCode" autocomplete="one-time-code" required autofocus />
      </label>
      <button type="submit">Testzugang öffnen</button>
      <div id="error" class="error" role="status"></div>
    </form>
    <p class="hint">Nach erfolgreicher Eingabe bleibt der Zugang auf diesem Gerät einige Tage gespeichert.</p>
  </main>
  <script>
    document.getElementById('testAccessForm').addEventListener('submit', function (event) {
      event.preventDefault();
      var error = document.getElementById('error');
      var code = document.getElementById('testCode').value.trim();
      var request = new XMLHttpRequest();
      error.textContent = '';
      request.open('POST', '/api/test-access', true);
      request.setRequestHeader('Content-Type', 'application/json');
      request.onreadystatechange = function () {
        if (request.readyState !== 4) return;
        if (request.status >= 200 && request.status < 300) {
          window.location.reload();
          return;
        }
        error.textContent = 'Der Testcode stimmt nicht.';
      };
      request.onerror = function () {
        error.textContent = 'Verbindung fehlgeschlagen.';
      };
      request.send(JSON.stringify({ code: code }));
    });
  </script>
</body>
</html>`);
}

async function handleTestAccess(req, res) {
  try {
    const parsed = JSON.parse((await readBody(req)) || '{}');
    const code = String(parsed.code || '').trim();
    if (!TEST_ACCESS_CODE || code !== TEST_ACCESS_CODE) {
      sendJson(res, 401, { error: 'Testcode stimmt nicht' });
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Set-Cookie': testAccessCookie(req)
    });
    res.end(JSON.stringify({ ok: true }));
  } catch {
    sendJson(res, 400, { error: 'JSON konnte nicht gelesen werden' });
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Body too large'));
        req.socket.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function serveStatic(req, res) {
  const requestPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, '');
  const absolutePath = path.join(PUBLIC_DIR, safePath);

  if (!absolutePath.startsWith(PUBLIC_DIR)) {
    sendText(res, 403, 'Forbidden');
    return;
  }

  fs.readFile(absolutePath, (err, content) => {
    if (err) {
      sendText(res, 404, 'Not Found');
      return;
    }

    const ext = path.extname(absolutePath).toLowerCase();
    const types = {
      '.css': 'text/css; charset=utf-8',
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.svg': 'image/svg+xml'
    };

    res.writeHead(200, {
      'Content-Type': types[ext] || 'application/octet-stream',
      'Permissions-Policy': 'geolocation=(self)'
    });
    res.end(content);
  });
}

function haversineMeters(lat1, lng1, lat2, lng2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const latDiff = toRad(lat2 - lat1);
  const lngDiff = toRad(lng2 - lng1);
  const a =
    Math.sin(latDiff / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(lngDiff / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function roundCoord(value) {
  return Math.round(value * 100000) / 100000;
}

function snapToGrid(lat, lng) {
  const latStep = 100 / 111320;
  const lngStep = 100 / (111320 * Math.cos((lat * Math.PI) / 180) || 1);
  const snappedLat = Math.round(lat / latStep) * latStep;
  const snappedLng = Math.round(lng / lngStep) * lngStep;
  return {
    lat: roundCoord(snappedLat),
    lng: roundCoord(snappedLng)
  };
}

function cellIdFor(lat, lng) {
  const cell = snapToGrid(lat, lng);
  return `${cell.lat.toFixed(4)}:${cell.lng.toFixed(4)}`;
}

function isFiniteLatLng(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

function pruneStore(store) {
  const now = Date.now();
  store.sessions = store.sessions.filter((session) => now - new Date(session.createdAt).getTime() <= TOKEN_TTL_MS);
  store.adminSessions = (store.adminSessions || []).filter((session) => now - new Date(session.createdAt).getTime() <= TOKEN_TTL_MS);
  store.cooldowns = store.cooldowns.filter((entry) => now - new Date(entry.createdAt).getTime() <= PUBLIC_RATING_COOLDOWN_MS);
  store.alertAudits = (store.alertAudits || []).filter((entry) => {
    const retentionUntil = entry.retentionUntil ? new Date(entry.retentionUntil).getTime() : 0;
    return retentionUntil && retentionUntil >= now;
  });
  store.users = store.users.map((user) => {
    const lastSeen = user.lastKnownLocation ? new Date(user.lastKnownLocation.updatedAt).getTime() : 0;
    if (lastSeen && now - lastSeen > COMPANY_LOCATION_TTL_MS) {
      return { ...user, lastKnownLocation: null };
    }
    return user;
  });
}

function aggregateRatings(ratings) {
  const buckets = new Map();

  ratings.forEach((entry) => {
    const bucket = buckets.get(entry.cellId) || {
      cellId: entry.cellId,
      lat: entry.lat,
      lng: entry.lng,
      count: 0,
      scoreSum: 0,
      lastReportAt: entry.createdAt
    };

    bucket.count += 1;
    bucket.scoreSum += entry.score;
    if (new Date(entry.createdAt).getTime() > new Date(bucket.lastReportAt).getTime()) {
      bucket.lastReportAt = entry.createdAt;
    }
    buckets.set(entry.cellId, bucket);
  });

  return [...buckets.values()].map((bucket) => {
    const averageScore = bucket.scoreSum / bucket.count;
    return {
      ...bucket,
      averageScore: Number(averageScore.toFixed(2)),
      band: bandForScore(averageScore)
    };
  });
}

function bandForScore(score) {
  if (score <= 1.5) return 'excellent';
  if (score <= 2.5) return 'good';
  if (score <= 3.5) return 'okay';
  if (score <= 4.5) return 'risky';
  return 'danger';
}

function labelForScore(score, language = 'de') {
  const labels = {
    de: {
      1: 'Sehr gut und sicher',
      2: 'Gut',
      3: 'Neutral',
      4: 'Eher schlecht',
      5: 'Sehr schlecht und unsicher',
      6: 'Alarmmeldung'
    },
    en: {
      1: 'Very good and safe',
      2: 'Good',
      3: 'Neutral',
      4: 'Rather poor',
      5: 'Very poor and unsafe',
      6: 'Alert'
    }
  };
  return labels[language]?.[score] || labels.de[score];
}

function averageScore(ratings) {
  if (!ratings.length) return null;
  return Number((ratings.reduce((sum, entry) => sum + entry.score, 0) / ratings.length).toFixed(2));
}

function findUserByToken(store, token) {
  if (!token) return null;
  const session = store.sessions.find((entry) => entry.token === token);
  if (!session) return null;
  const user = store.users.find((entry) => entry.id === session.userId);
  if (!user) return null;
  return { session, user };
}

function getBearerToken(req) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

function findAdminByToken(store, token) {
  if (!token) return null;
  const session = (store.adminSessions || []).find((entry) => entry.token === token);
  if (!session) return null;
  return { session, admin: { name: 'Peter Krawitz', role: 'admin' } };
}

function requireAdmin(req, res, store) {
  const auth = findAdminByToken(store, getBearerToken(req));
  if (!auth) {
    sendJson(res, 401, { error: 'Admin-Login erforderlich' });
    return null;
  }
  return auth;
}

function createToken() {
  return crypto.randomBytes(24).toString('hex');
}

function makeHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function viewerFingerprint(req, cellId) {
  const ip = req.socket.remoteAddress || '0.0.0.0';
  const ua = req.headers['user-agent'] || 'unknown';
  const dateKey = new Date().toISOString().slice(0, 10);
  return makeHash(`${ANTI_SPAM_SALT}|${dateKey}|${cellId}|${ip}|${ua}`);
}

function updateUserLocation(store, userId, lat, lng) {
  const index = store.users.findIndex((entry) => entry.id === userId);
  if (index === -1 || !isFiniteLatLng(lat, lng)) return;

  store.users[index] = {
    ...store.users[index],
    lastKnownLocation: {
      lat: roundCoord(lat),
      lng: roundCoord(lng),
      updatedAt: new Date().toISOString()
    }
  };
}

function clearUserLocation(store, userId) {
  const index = store.users.findIndex((entry) => entry.id === userId);
  if (index === -1) return;
  store.users[index] = {
    ...store.users[index],
    lastKnownLocation: null
  };
}

function companySummary(store) {
  return store.companies.map((company) => ({
    id: company.id,
    name: company.name,
    color: company.color,
    logoText: company.logoText
  }));
}

function publicSummary(store, view) {
  const now = Date.now();
  const validView = ['today', 'week', 'month', 'year'].includes(view) ? view : 'year';
  const fromByView = {
    today: now - 24 * 60 * 60 * 1000,
    week: now - 7 * 24 * 60 * 60 * 1000,
    month: now - 30 * 24 * 60 * 60 * 1000,
    year: now - 365 * 24 * 60 * 60 * 1000
  };
  const from = fromByView[validView];
  const ratings = store.ratings.filter((entry) => new Date(entry.createdAt).getTime() >= from);
  const cells = aggregateRatings(ratings);
  const alerts = store.alerts;
  const funReports = store.funReports.filter((entry) => entry.isVisible !== false);
  return {
    cells,
    alerts,
    funReports,
    companies: companySummary(store),
    emergencyPlaces: store.emergencyPlaces,
    meta: {
      defaultView: 'year',
      requestedView: validView,
      ratingCount: ratings.length,
      averageScore: averageScore(ratings)
    }
  };
}

function areaDetails(store, lat, lng) {
  const now = Date.now();
  const oneYear = now - 365 * 24 * 60 * 60 * 1000;
  const sevenDays = now - 7 * 24 * 60 * 60 * 1000;
  const nearby = store.ratings.filter((entry) => haversineMeters(lat, lng, entry.lat, entry.lng) <= 100);
  const weekly = nearby.filter((entry) => new Date(entry.createdAt).getTime() >= sevenDays);
  const yearly = nearby.filter((entry) => new Date(entry.createdAt).getTime() >= oneYear);
  const allYearCells = aggregateRatings(store.ratings.filter((entry) => new Date(entry.createdAt).getTime() >= oneYear));
  const excellent = allYearCells
    .filter((entry) => entry.averageScore <= 1.5)
    .sort((a, b) => haversineMeters(lat, lng, a.lat, a.lng) - haversineMeters(lat, lng, b.lat, b.lng))[0] || null;
  const nearestPolice = [...store.emergencyPlaces]
    .filter((entry) => entry.kind === 'police')
    .sort((a, b) => haversineMeters(lat, lng, a.lat, a.lng) - haversineMeters(lat, lng, b.lat, b.lng))[0] || null;
  const nearestHospital = [...store.emergencyPlaces]
    .filter((entry) => entry.kind === 'hospital')
    .sort((a, b) => haversineMeters(lat, lng, a.lat, a.lng) - haversineMeters(lat, lng, b.lat, b.lng))[0] || null;

  return {
    point: { lat: roundCoord(lat), lng: roundCoord(lng) },
    radiusMeters: 100,
    year: {
      count: yearly.length,
      averageScore: averageScore(yearly),
      label: yearly.length ? labelForScore(Math.round(averageScore(yearly) || 3)) : 'Keine Daten'
    },
    today: {
      count: weekly.length,
      averageScore: averageScore(weekly),
      label: weekly.length ? labelForScore(Math.round(averageScore(weekly) || 3)) : 'Keine Daten'
    },
    nearestExcellent: excellent,
    nearestPolice,
    nearestHospital
  };
}

function searchPlaces(store, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return store.places
    .filter((place) => place.label.toLowerCase().includes(normalized))
    .slice(0, 8);
}

function distanceMetersBetween(aLat, aLng, bLat, bLng) {
  const earthRadius = 6371000;
  const toRadians = (value) => (value * Math.PI) / 180;
  const dLat = toRadians(bLat - aLat);
  const dLng = toRadians(bLng - aLng);
  const lat1 = toRadians(aLat);
  const lat2 = toRadians(bLat);
  const haversine =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function shortLocationLabel(store, lat, lng) {
  const candidates = [
    ...store.emergencyPlaces.map((entry) => ({
      distance: distanceMetersBetween(lat, lng, entry.lat, entry.lng),
      label: String(entry.address || entry.name || '').split(',')[0].trim()
    })),
    ...store.places.map((entry) => ({
      distance: distanceMetersBetween(lat, lng, entry.lat, entry.lng),
      label: String(entry.label || '').split(',')[0].trim()
    }))
  ]
    .filter((entry) => entry.label)
    .sort((a, b) => a.distance - b.distance);

  if (candidates.length && candidates[0].distance <= 3000) {
    return candidates[0].label;
  }

  return `Bereich im 100-m-Radius`;
}

function aggregateTickerItems(store) {
  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const cutoff = startOfToday.getTime();
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

  store.ratings.forEach((entry) => {
    const createdAt = new Date(entry.createdAt).getTime();
    if (createdAt >= cutoff && PUBLIC_SCORES.includes(entry.score)) {
      counts[entry.score] += 1;
    }
  });

  store.alerts.forEach((entry) => {
    const createdAt = new Date(entry.createdAt).getTime();
    if (createdAt >= cutoff) {
      counts[6] += 1;
    }
  });

  return [1, 2, 3, 4, 5, 6].map((score) => ({
    categoryType: 'summary',
    score,
    count: counts[score],
    isCritical: score >= 5,
    createdAt: new Date(now).toISOString()
  }));
}

function legendFilterData(store, score) {
  const now = Date.now();
  const oneYear = now - 365 * 24 * 60 * 60 * 1000;

  if (score === 6) {
    return {
      cells: [],
      alerts: store.alerts,
      funReports: [],
      companies: companySummary(store),
      emergencyPlaces: store.emergencyPlaces
    };
  }

  if (score === 5) {
    return {
      cells: store.ratings
        .filter((entry) => entry.score === 5 && new Date(entry.createdAt).getTime() >= oneYear)
        .map((entry) => ({
          cellId: entry.id,
          lat: entry.lat,
          lng: entry.lng,
          count: 1,
          averageScore: 5,
          band: 'danger',
          lastReportAt: entry.createdAt
        })),
      alerts: [],
      funReports: [],
      companies: companySummary(store),
      emergencyPlaces: store.emergencyPlaces
    };
  }

  const yearlyCells = aggregateRatings(
    store.ratings.filter((entry) => new Date(entry.createdAt).getTime() >= oneYear)
  );
  const lower = score - 0.5;
  const upper = score + 0.5;

  return {
    cells: yearlyCells.filter((cell) => cell.averageScore >= lower && cell.averageScore < upper),
    alerts: [],
    funReports: [],
    companies: companySummary(store),
    emergencyPlaces: store.emergencyPlaces
  };
}

function exportScoreLabel(score) {
  const labels = {
    1: 'sehr_schoen_sicher',
    2: 'schoen_sicher',
    3: 'neutral',
    4: 'eher_schlecht',
    5: 'schlecht_unsicher',
    6: 'aktuelle_gefahr'
  };
  return labels[score] || 'unbekannt';
}

function exportAlertLabel(alertType) {
  const labels = {
    general: 'aktuelle_gefahr',
    gun: 'schusswaffe',
    knife: 'messer',
    violence: 'gewalt',
    mob: 'mob'
  };
  return labels[alertType] || alertType || 'unbekannt';
}

function exportRecords(store, type = 'all') {
  const publicRatings = store.ratings.map((entry) => ({
    dataset: 'anonymous_rating',
    id: entry.id,
    createdAt: entry.createdAt,
    cellId: entry.cellId,
    lat: entry.lat,
    lng: entry.lng,
    score: entry.score,
    category: exportScoreLabel(entry.score),
    source: entry.source || 'public',
    anonymous: true,
    reporterId: '',
    reporterName: '',
    reporterRole: '',
    companyId: '',
    companyName: '',
    alertType: '',
    funTag: '',
    note: '',
    alertId: '',
    retentionUntil: ''
  }));

  const funReports = store.funReports.map((entry) => ({
    dataset: 'anonymous_fun_report',
    id: entry.id,
    createdAt: entry.createdAt,
    cellId: cellIdFor(entry.lat, entry.lng),
    lat: entry.lat,
    lng: entry.lng,
    score: '',
    category: entry.tag,
    source: 'public_fun',
    anonymous: true,
    reporterId: '',
    reporterName: '',
    reporterRole: '',
    companyId: '',
    companyName: '',
    alertType: '',
    funTag: entry.tag,
    note: '',
    alertId: '',
    retentionUntil: ''
  }));

  const registeredAlerts = store.alerts.map((entry) => ({
    dataset: 'registered_alert_anonymized',
    id: entry.id,
    createdAt: entry.createdAt,
    cellId: cellIdFor(entry.lat, entry.lng),
    lat: entry.lat,
    lng: entry.lng,
    score: 6,
    category: exportAlertLabel(entry.alertType),
    source: entry.source || 'registered_alert_anonymized',
    anonymous: true,
    reporterId: '',
    reporterName: '',
    reporterRole: '',
    companyId: '',
    companyName: '',
    alertType: entry.alertType || 'general',
    funTag: '',
    note: entry.note || '',
    alertId: '',
    retentionUntil: ''
  }));

  const alertAudits = (store.alertAudits || []).map((entry) => ({
    dataset: 'registered_alert_audit',
    id: entry.id,
    createdAt: entry.createdAt,
    cellId: cellIdFor(entry.lat, entry.lng),
    lat: entry.lat,
    lng: entry.lng,
    score: 6,
    category: exportAlertLabel(entry.alertType),
    source: 'registered_audit',
    anonymous: false,
    reporterId: entry.reporter?.id || '',
    reporterName: entry.reporter?.name || '',
    reporterRole: entry.reporter?.role || '',
    companyId: entry.reporter?.companyId || '',
    companyName: entry.reporter?.companyName || '',
    alertType: entry.alertType || 'general',
    funTag: '',
    note: entry.note || '',
    alertId: entry.alertId || '',
    retentionUntil: entry.retentionUntil || ''
  }));

  const recordsByType = {
    all: [...publicRatings, ...funReports, ...registeredAlerts],
    public: [...publicRatings, ...funReports],
    ratings: publicRatings,
    fun: funReports,
    registered: registeredAlerts,
    alerts: registeredAlerts,
    audit: alertAudits,
    alertAudits
  };

  return recordsByType[type] || recordsByType.all;
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n\r;]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function recordsToCsv(records) {
  const headers = [
    'dataset',
    'id',
    'createdAt',
    'cellId',
    'lat',
    'lng',
    'score',
    'category',
    'source',
    'anonymous',
    'reporterId',
    'reporterName',
    'reporterRole',
    'companyId',
    'companyName',
    'alertType',
    'funTag',
    'note',
    'alertId',
    'retentionUntil'
  ];
  const rows = records.map((record) => headers.map((header) => csvEscape(record[header])).join(';'));
  return [headers.join(';'), ...rows].join('\n');
}

function isLocalRequest(req) {
  const remote = req.socket.remoteAddress || '';
  return ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(remote) || remote.endsWith('::1');
}

function normalizeIdPart(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function isValidManagedPin(pin) {
  return /^[0-9]{5}[a-zA-Z]{2}$/.test(String(pin || ''));
}

function publicUserForAdmin(user) {
  return {
    id: user.id,
    code: user.code,
    pin: user.pin,
    role: user.role,
    name: user.name,
    companyId: user.companyId,
    companyName: user.companyName,
    lastKnownLocation: user.lastKnownLocation
  };
}

function adminPayload(store) {
  return {
    companies: store.companies,
    users: store.users.map(publicUserForAdmin)
  };
}

function analyticsSummary(store) {
  const oneYear = Date.now() - 365 * 24 * 60 * 60 * 1000;
  const yearlyRatings = store.ratings.filter((entry) => new Date(entry.createdAt).getTime() >= oneYear);
  const cells = aggregateRatings(yearlyRatings);
  const funByCell = new Map();

  store.funReports.forEach((entry) => {
    const cellId = cellIdFor(entry.lat, entry.lng);
    const bucket = funByCell.get(cellId) || {
      cellId,
      lat: entry.lat,
      lng: entry.lng,
      count: 0,
      tags: {}
    };
    bucket.count += 1;
    bucket.tags[entry.tag] = (bucket.tags[entry.tag] || 0) + 1;
    funByCell.set(cellId, bucket);
  });

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      anonymousRatings: store.ratings.length,
      anonymousFunReports: store.funReports.length,
      registeredAlerts: store.alerts.length,
      temporaryAlertAudits: (store.alertAudits || []).length
    },
    beautifulAreas: cells
      .filter((cell) => cell.averageScore <= 2)
      .sort((a, b) => b.count - a.count || a.averageScore - b.averageScore)
      .slice(0, 50),
    highLoadAreas: cells
      .filter((cell) => cell.averageScore >= 4)
      .sort((a, b) => b.averageScore - a.averageScore || b.count - a.count)
      .slice(0, 50),
    funHotspots: [...funByCell.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 50),
    registeredAlerts: store.alerts
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 200)
  };
}

ensureFiles();

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/test-access' && req.method === 'POST') {
    await handleTestAccess(req, res);
    return;
  }

  if (!hasTestAccess(req)) {
    if (wantsHtml(req, url)) {
      sendTestAccessPage(res);
      return;
    }
    sendJson(res, 403, { error: 'Testzugang erforderlich' });
    return;
  }

  const store = readStore();
  pruneStore(store);

  if (url.pathname === '/api/bootstrap' && req.method === 'GET') {
    writeStore(store);
    sendJson(res, 200, {
      appName: 'sicherodernicht',
      defaultLanguage: 'de',
      demoAccounts: [
        { code: 'anna', pin: '12345ab', role: 'private' },
        { code: 'safeguard1', pin: '24680sg', role: 'company' },
        { code: 'safeguard2', pin: '86420sg', role: 'company' },
        { code: 'cityshield', pin: '11220cs', role: 'company' }
      ],
      companies: companySummary(store),
      emergencyPlaces: store.emergencyPlaces
    });
    return;
  }

  if (url.pathname === '/api/map-data' && req.method === 'GET') {
    const requested = url.searchParams.get('view') || 'year';
    const view = ['today', 'week', 'month', 'year'].includes(requested) ? requested : 'year';
    writeStore(store);
    sendJson(res, 200, publicSummary(store, view));
    return;
  }

  if (url.pathname === '/api/area' && req.method === 'GET') {
    const lat = Number(url.searchParams.get('lat'));
    const lng = Number(url.searchParams.get('lng'));
    if (!isFiniteLatLng(lat, lng)) {
      sendJson(res, 400, { error: 'Ungultige Koordinaten' });
      return;
    }

    writeStore(store);
    sendJson(res, 200, areaDetails(store, lat, lng));
    return;
  }

  if (url.pathname === '/api/search' && req.method === 'GET') {
    const q = url.searchParams.get('q') || '';
    sendJson(res, 200, { results: searchPlaces(store, q) });
    return;
  }

  if (url.pathname === '/api/ticker' && req.method === 'GET') {
    const items = aggregateTickerItems(store);
    writeStore(store);
    sendJson(res, 200, { items });
    return;
  }

  if (url.pathname === '/api/legend-filter' && req.method === 'GET') {
    const score = Number(url.searchParams.get('score'));
    if (![1, 2, 3, 4, 5, 6].includes(score)) {
      sendJson(res, 400, { error: 'Ungultige Kategorie' });
      return;
    }

    writeStore(store);
    sendJson(res, 200, legendFilterData(store, score));
    return;
  }

  if (url.pathname === '/api/data/export' && req.method === 'GET') {
    const admin = requireAdmin(req, res, store);
    if (!admin) return;

    const type = url.searchParams.get('type') || 'all';
    const format = url.searchParams.get('format') || 'json';
    const records = exportRecords(store, type);

    if (format === 'csv') {
      sendText(res, 200, recordsToCsv(records), 'text/csv; charset=utf-8');
      return;
    }

    sendJson(res, 200, {
      exportedAt: new Date().toISOString(),
      type,
      count: records.length,
      records
    });
    return;
  }

  if (url.pathname === '/api/data/summary' && req.method === 'GET') {
    const admin = requireAdmin(req, res, store);
    if (!admin) return;

    sendJson(res, 200, analyticsSummary(store));
    return;
  }

  if (url.pathname === '/api/admin/login' && req.method === 'POST') {
    try {
      const parsed = JSON.parse((await readBody(req)) || '{}');
      const code = String(parsed.code || '').trim().toLowerCase();
      const pin = String(parsed.pin || '').trim();

      if (code !== ADMIN_CODE || pin !== ADMIN_PIN) {
        sendJson(res, 401, { error: 'Admin-Login fehlgeschlagen' });
        return;
      }

      const token = createToken();
      store.adminSessions = store.adminSessions || [];
      store.adminSessions.push({
        token,
        createdAt: new Date().toISOString()
      });
      writeStore(store);
      sendJson(res, 200, { token, admin: { name: 'Peter Krawitz', role: 'admin' } });
    } catch {
      sendJson(res, 400, { error: 'JSON konnte nicht gelesen werden' });
    }
    return;
  }

  if (url.pathname === '/api/admin/logout' && req.method === 'POST') {
    try {
      const parsed = JSON.parse((await readBody(req)) || '{}');
      const token = String(parsed.token || getBearerToken(req));
      store.adminSessions = (store.adminSessions || []).filter((entry) => entry.token !== token);
      writeStore(store);
      sendJson(res, 200, { ok: true });
    } catch {
      sendJson(res, 400, { error: 'JSON konnte nicht gelesen werden' });
    }
    return;
  }

  if (url.pathname === '/api/admin/me' && req.method === 'GET') {
    const admin = requireAdmin(req, res, store);
    if (!admin) return;
    sendJson(res, 200, { admin: admin.admin });
    return;
  }

  if (url.pathname === '/api/admin/catalog' && req.method === 'GET') {
    const admin = requireAdmin(req, res, store);
    if (!admin) return;

    sendJson(res, 200, adminPayload(store));
    return;
  }

  if (url.pathname === '/api/admin/company' && req.method === 'POST') {
    const admin = requireAdmin(req, res, store);
    if (!admin) return;

    try {
      const parsed = JSON.parse((await readBody(req)) || '{}');
      const name = String(parsed.name || '').trim();
      const color = String(parsed.color || '#2563eb').trim();
      const logoText = String(parsed.logoText || '').trim().slice(0, 4).toUpperCase();
      const id = String(parsed.id || `company-${normalizeIdPart(name || Date.now())}`).trim();

      if (!name || !logoText || !/^#[0-9a-fA-F]{6}$/.test(color)) {
        sendJson(res, 400, { error: 'Firma braucht Name, Logo-Kurztext und gueltige Farbe' });
        return;
      }

      const company = { id, name, color, logoText };
      const index = store.companies.findIndex((entry) => entry.id === id);
      if (index === -1) {
        store.companies.push(company);
      } else {
        store.companies[index] = company;
        store.users = store.users.map((user) =>
          user.companyId === id ? { ...user, companyName: name } : user
        );
      }

      writeStore(store);
      sendJson(res, 200, adminPayload(store));
    } catch {
      sendJson(res, 400, { error: 'JSON konnte nicht gelesen werden' });
    }
    return;
  }

  if (url.pathname === '/api/admin/company' && req.method === 'DELETE') {
    const admin = requireAdmin(req, res, store);
    if (!admin) return;

    const id = url.searchParams.get('id') || '';
    store.companies = store.companies.filter((company) => company.id !== id);
    store.users = store.users.map((user) =>
      user.companyId === id ? { ...user, role: 'private', companyId: null, companyName: null } : user
    );
    writeStore(store);
    sendJson(res, 200, adminPayload(store));
    return;
  }

  if (url.pathname === '/api/admin/user' && req.method === 'POST') {
    const admin = requireAdmin(req, res, store);
    if (!admin) return;

    try {
      const parsed = JSON.parse((await readBody(req)) || '{}');
      const id = String(parsed.id || `u-${normalizeIdPart(parsed.role || 'user')}-${Date.now()}`).trim();
      const name = String(parsed.name || '').trim();
      const code = String(parsed.code || '').trim().toLowerCase();
      const pin = String(parsed.pin || '').trim();
      const role = parsed.role === 'company' ? 'company' : 'private';
      const companyId = role === 'company' ? String(parsed.companyId || '').trim() : null;
      const company = companyId ? store.companies.find((entry) => entry.id === companyId) || null : null;

      if (!name || !code || !isValidManagedPin(pin)) {
        sendJson(res, 400, { error: 'Nutzer braucht Name, Login-Code und PIN im Format 12345ab' });
        return;
      }
      if (role === 'company' && !company) {
        sendJson(res, 400, { error: 'Firmennutzer braucht eine vorhandene Firma' });
        return;
      }
      if (store.users.some((user) => user.code === code && user.id !== id)) {
        sendJson(res, 409, { error: 'Login-Code ist bereits vergeben' });
        return;
      }

      const existing = store.users.find((user) => user.id === id);
      const user = {
        id,
        code,
        pin,
        role,
        name,
        companyId: role === 'company' ? company.id : null,
        companyName: role === 'company' ? company.name : null,
        lastKnownLocation: existing?.lastKnownLocation || null
      };
      const index = store.users.findIndex((entry) => entry.id === id);
      if (index === -1) {
        store.users.push(user);
      } else {
        store.users[index] = user;
      }

      writeStore(store);
      sendJson(res, 200, adminPayload(store));
    } catch {
      sendJson(res, 400, { error: 'JSON konnte nicht gelesen werden' });
    }
    return;
  }

  if (url.pathname === '/api/admin/user' && req.method === 'DELETE') {
    const admin = requireAdmin(req, res, store);
    if (!admin) return;

    const id = url.searchParams.get('id') || '';
    store.users = store.users.filter((user) => user.id !== id);
    store.sessions = store.sessions.filter((session) => session.userId !== id);
    writeStore(store);
    sendJson(res, 200, adminPayload(store));
    return;
  }

  if (url.pathname === '/api/rate' && req.method === 'POST') {
    try {
      const parsed = JSON.parse((await readBody(req)) || '{}');
      const lat = Number(parsed.lat);
      const lng = Number(parsed.lng);
      const score = Number(parsed.score);

      if (!isFiniteLatLng(lat, lng) || !PUBLIC_SCORES.includes(score)) {
        sendJson(res, 400, { error: 'Ungultige Bewertung' });
        return;
      }

      const snapped = snapToGrid(lat, lng);
      const cellId = cellIdFor(lat, lng);
      const fingerprint = viewerFingerprint(req, cellId);
      const latestSameCell = store.cooldowns.find((entry) => entry.kind === 'public-rating' && entry.fingerprint === fingerprint);

      if (latestSameCell) {
        sendJson(res, 429, {
          error: 'Zu viele Bewertungen in kurzer Zeit',
          retryAfterMinutes: Math.ceil((PUBLIC_RATING_COOLDOWN_MS - (Date.now() - new Date(latestSameCell.createdAt).getTime())) / 60000)
        });
        return;
      }

      store.ratings.push({
        id: `rating-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        cellId,
        lat: snapped.lat,
        lng: snapped.lng,
        score,
        createdAt: new Date().toISOString(),
        source: 'public'
      });
      store.cooldowns.push({
        kind: 'public-rating',
        fingerprint,
        cellId,
        createdAt: new Date().toISOString()
      });

      writeStore(store);
      sendJson(res, 201, { ok: true, cellId });
    } catch {
      sendJson(res, 400, { error: 'JSON konnte nicht gelesen werden' });
    }
    return;
  }

  if (url.pathname === '/api/fun' && req.method === 'POST') {
    try {
      const parsed = JSON.parse((await readBody(req)) || '{}');
      const lat = Number(parsed.lat);
      const lng = Number(parsed.lng);
      const tag = String(parsed.tag || '');

      if (!isFiniteLatLng(lat, lng) || !FUN_TAGS.includes(tag)) {
        sendJson(res, 400, { error: 'Ungultige Fun-Meldung' });
        return;
      }

      const snapped = snapToGrid(lat, lng);
      store.funReports.push({
        id: `fun-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        lat: snapped.lat,
        lng: snapped.lng,
        tag,
        createdAt: new Date().toISOString(),
        isVisible: true
      });
      writeStore(store);
      sendJson(res, 201, { ok: true });
    } catch {
      sendJson(res, 400, { error: 'JSON konnte nicht gelesen werden' });
    }
    return;
  }

  if (url.pathname === '/api/auth/login' && req.method === 'POST') {
    try {
      const parsed = JSON.parse((await readBody(req)) || '{}');
      const code = String(parsed.code || '').trim().toLowerCase();
      const pin = String(parsed.pin || '').trim();
      const lat = Number(parsed.lat);
      const lng = Number(parsed.lng);
      const user = store.users.find((entry) => entry.code === code && entry.pin === pin);

      if (!user) {
        sendJson(res, 401, { error: 'Login fehlgeschlagen' });
        return;
      }

      const token = createToken();
      store.sessions.push({
        token,
        userId: user.id,
        createdAt: new Date().toISOString()
      });

      if (isFiniteLatLng(lat, lng)) {
        updateUserLocation(store, user.id, lat, lng);
      }

      writeStore(store);
      sendJson(res, 200, {
        token,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          companyName: user.companyName
        }
      });
    } catch {
      sendJson(res, 400, { error: 'JSON konnte nicht gelesen werden' });
    }
    return;
  }

  if (url.pathname === '/api/auth/logout' && req.method === 'POST') {
    try {
      const parsed = JSON.parse((await readBody(req)) || '{}');
      const token = String(parsed.token || '');
      store.sessions = store.sessions.filter((entry) => entry.token !== token);
      writeStore(store);
      sendJson(res, 200, { ok: true });
    } catch {
      sendJson(res, 400, { error: 'JSON konnte nicht gelesen werden' });
    }
    return;
  }

  if (url.pathname === '/api/me' && req.method === 'GET') {
    const token = url.searchParams.get('token') || '';
    const auth = findUserByToken(store, token);
    if (!auth) {
      sendJson(res, 401, { error: 'Nicht angemeldet' });
      return;
    }

    const { user } = auth;
    const activeSessionUserIds = new Set(store.sessions.map((entry) => entry.userId));
    const companyMembers = user.companyId
      ? store.users
          .filter((entry) => entry.companyId === user.companyId && entry.lastKnownLocation && activeSessionUserIds.has(entry.id))
          .map((entry) => ({
            id: entry.id,
            name: entry.name,
            location: entry.lastKnownLocation,
            companyName: entry.companyName,
            companyColor: store.companies.find((company) => company.id === entry.companyId)?.color || '#2563eb'
          }))
      : [];

    writeStore(store);
    sendJson(res, 200, {
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
        companyName: user.companyName
      },
      companyMembers
    });
    return;
  }

  if (url.pathname === '/api/location' && req.method === 'POST') {
    try {
      const parsed = JSON.parse((await readBody(req)) || '{}');
      const token = String(parsed.token || '');
      const lat = Number(parsed.lat);
      const lng = Number(parsed.lng);
      const share = parsed.share !== false;
      const auth = findUserByToken(store, token);

      if (!auth) {
        sendJson(res, 401, { error: 'Nicht angemeldet' });
        return;
      }
      if (!share) {
        clearUserLocation(store, auth.user.id);
        writeStore(store);
        sendJson(res, 200, { ok: true, sharing: false });
        return;
      }
      if (!isFiniteLatLng(lat, lng)) {
        sendJson(res, 400, { error: 'Ungultige Koordinaten' });
        return;
      }

      updateUserLocation(store, auth.user.id, lat, lng);
      writeStore(store);
      sendJson(res, 200, { ok: true, sharing: true });
    } catch {
      sendJson(res, 400, { error: 'JSON konnte nicht gelesen werden' });
    }
    return;
  }

  if (url.pathname === '/api/alert' && req.method === 'POST') {
    try {
      const parsed = JSON.parse((await readBody(req)) || '{}');
      const token = String(parsed.token || '');
      const lat = Number(parsed.lat);
      const lng = Number(parsed.lng);
      const alertType = String(parsed.alertType || 'general');
      const note = String(parsed.note || '').slice(0, 220);
      const auth = findUserByToken(store, token);

      if (!auth) {
        sendJson(res, 401, { error: 'Nicht angemeldet' });
        return;
      }
      if (!isFiniteLatLng(lat, lng)) {
        sendJson(res, 400, { error: 'Ungultige Koordinaten' });
        return;
      }
      if (auth.user.role === 'company' && alertType !== 'general' && !COMPANY_ALERT_TYPES.includes(alertType)) {
        sendJson(res, 400, { error: 'Unbekannter Alarmtyp' });
        return;
      }

      updateUserLocation(store, auth.user.id, lat, lng);
      const snapped = snapToGrid(lat, lng);
      const company = auth.user.companyId
        ? store.companies.find((entry) => entry.id === auth.user.companyId) || null
        : null;

      const alertId = `alert-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
      const createdAt = new Date().toISOString();
      const anonymized = {
        id: alertId,
        lat: snapped.lat,
        lng: snapped.lng,
        score: 6,
        alertType,
        note,
        createdAt,
        source: 'registered_alert_anonymized'
      };
      const audit = buildAlertAudit({
        alertId,
        createdAt,
        lat: snapped.lat,
        lng: snapped.lng,
        alertType,
        note,
        user: auth.user,
        company
      });

      store.alerts.push(anonymized);
      store.alertAudits = store.alertAudits || [];
      store.alertAudits.push(audit);

      writeStore(store);
      sendJson(res, 201, { ok: true });
    } catch {
      sendJson(res, 400, { error: 'JSON konnte nicht gelesen werden' });
    }
    return;
  }

  if (url.pathname === '/api/company-feed' && req.method === 'GET') {
    const token = url.searchParams.get('token') || '';
    const auth = findUserByToken(store, token);
    if (!auth) {
      sendJson(res, 401, { error: 'Nicht angemeldet' });
      return;
    }
    if (auth.user.role !== 'company') {
      sendJson(res, 403, { error: 'Nur fur Firmenkonten' });
      return;
    }

    const members = store.users
      .filter((entry) => entry.companyId === auth.user.companyId)
      .map((entry) => ({
        id: entry.id,
        name: entry.name,
        location: entry.lastKnownLocation
      }));

    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const alerts = (store.alertAudits || [])
      .filter((entry) => entry.reporter?.role === 'company' && new Date(entry.createdAt).getTime() >= cutoff)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    writeStore(store);
    sendJson(res, 200, { members, alerts });
    return;
  }

  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`sicherodernicht lauft auf http://localhost:${PORT}`);
});
