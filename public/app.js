const CONSENT_KEY = 'sicherodernicht-consent-v1';
const DESIGN_KEY = 'sicherodernicht-design-mode';

function storedConsent() {
  try {
    return JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null');
  } catch {
    return null;
  }
}

function hasComfortConsent() {
  return storedConsent()?.comfort === true;
}

function cleanupComfortStorage() {
  localStorage.removeItem('sicherodernicht-language');
  localStorage.removeItem('sicherodernicht-share-company-location');
  localStorage.removeItem('sicherodernicht-login-code');
  localStorage.removeItem('sicherodernicht-login-pin');
  localStorage.removeItem(DESIGN_KEY);
}

function rememberComfortValue(key, value) {
  if (hasComfortConsent()) {
    localStorage.setItem(key, value);
  }
}

function storedDesignMode() {
  const saved = hasComfortConsent() ? localStorage.getItem(DESIGN_KEY) : sessionStorage.getItem(DESIGN_KEY);
  return saved === 'classic' ? 'classic' : 'friendly';
}

const state = {
  language: hasComfortConsent() ? localStorage.getItem('sicherodernicht-language') || 'de' : 'de',
  userPos: null,
  token: sessionStorage.getItem('sicherodernicht-token') || '',
  user: null,
  currentView: 'year',
  emergencyMode: false,
  funMode: false,
  mapData: null,
  areaData: null,
  companyMembers: [],
  companyAlerts: [],
  searchResults: [],
  cellCircles: [],
  followUser: false,
  pendingFunPos: null,
  tickerItems: [],
  legendFilter: null,
  currentAlertIndex: -1,
  shareCompanyLocation: hasComfortConsent() ? localStorage.getItem('sicherodernicht-share-company-location') !== 'off' : true,
  designMode: storedDesignMode()
};

const texts = {
  de: {
    defaultView: 'Standard: dieses Jahr',
    brandClaim: 'Sicher unterwegs. Schöne Orte teilen.',
    heroTitle: 'Bin ich hier sicher? Wo ist es schön?',
    heroCopy: 'Teile mit anderen, wie Du dich an einem bestimmten Ort gefühlt hast und wo Du viel Spaß hattest. Die Karte zeigt Dir, wie andere Menschen die Umgebung bewerten, ohne bestimmte Geschäfte oder Personen herauszustellen.',
    locateMe: 'Mein Standort',
    locateActionHint: 'freigeben · zentrieren · anzeigen',
    todayMode: 'Heute',
    thisWeek: 'Diese Woche',
    thisMonth: 'Dieser Monat',
    thisYear: 'Dieses Jahr',
    search: 'Suchen',
    yourPosition: 'Dein Standort',
    noPosition: 'Noch nicht gesetzt',
    locating: 'Standort wird ermittelt...',
    currentMode: 'Ansicht',
    quickRate: 'Schnell bewerten',
    radiusHint: 'Automatisch auf 100 m gerundet',
    funMode: 'Spaß gehabt?',
    funModeHint: 'Fun-Bewertungen öffnen',
    funModeHintOpen: 'Fun-Bewertungen schließen',
    ratingInvite: 'Wie ist es hier? Teile es mit Anderen:',
    emergency: 'Notfall',
    emergencyInfo: 'Nur für registrierte Firmennutzer',
    emergencyCall: 'Bei akuter Gefahr 110 anrufen',
    needSecurity: 'Ich brauche mehr Sicherheit',
    orientation: 'Aktuelle Meldungen',
    currentReports: 'Aktuelle Meldungen',
    currentAlertSingular: 'aktuelle Meldung',
    currentAlertPlural: 'aktuelle Meldungen',
    noCurrentAlerts: 'Keine aktuellen Meldungen',
    reportSingular: 'Meldung',
    reportPlural: 'Meldungen',
    last24Hours: 'letzte 24 Stunden',
    showOnMap: 'Anzeigen',
    filterActive: 'Filter aktiv',
    filterEnded: 'Filter wieder ausgeblendet',
    alertsTitle: 'Registrierte Nutzer',
    logout: 'Logout',
    adTitle: 'biss-berlin.com',
    bannerCopy: 'Präsentiert von der Berliner Initiative sichere Stadt e.V.',
    designClassic: 'Klassisches Design',
    designFriendly: 'Freundliches Design',
    excellentNearby: 'Pfeile zeigen zum nachsten sehr gut bewerteten Ort',
    centerMap: 'Zentrieren',
    searchPlaceholder: 'Ort suchen oder ausprobieren: Alexanderplatz',
    viewYear: 'Dieses Jahr',
    viewMonth: 'Dieser Monat',
    viewWeek: 'Diese Woche',
    viewToday: 'Heute',
    locateError: 'Standort konnte nicht bestimmt werden.',
    secureContext: 'Geolocation braucht HTTPS oder localhost.',
    searching: 'Suche lauft...',
    noSearchResults: 'Ort nicht gefunden. Bitte suche genauer oder mit Stadtangabe.',
    selectLocationFirst: 'Bitte zuerst deinen Standort setzen.',
    ratingSaved: 'Bewertung gespeichert.',
    ratingBlocked: 'Bitte warte etwas, bevor du denselben Bereich erneut bewertest.',
    funSaved: 'Fun-Hinweis gespeichert.',
    emergencyOn: 'Notfallpfeile zu Polizei und Krankenhaus sind eingeblendet.',
    emergencyOff: 'Notfallansicht wieder ausgeblendet.',
    loadingArea: 'Bereich wird geladen...',
    noAreaData: 'Noch keine Daten im 100-Meter-Radius.',
    yearSummary: 'Durchschnitt letztes Jahr',
    todaySummary: 'Durchschnitt letzte 7 Tage',
    noData: 'Keine Daten',
    nearestExcellent: 'Nächstes Top-Gebiet',
    nearestPolice: 'Nächste Polizeiwache',
    nearestHospital: 'Nächstes Krankenhaus',
    loginIntro: 'Demo-Login fur Privat und Unternehmen. Rollen steuern, welche Sicherheitsfunktionen sichtbar sind.',
    privateAccess: 'Privatzugang',
    companyAccess: 'Firmenzugang',
    privateDemo: 'Demo privat: anna / 12345ab',
    companyDemo: 'Demo firma: safeguard1 / 24680sg',
    loginCode: 'Login-Code',
    loginPin: 'PIN',
    loginSubmit: 'Einloggen',
    rememberLogin: 'Login-Daten auf diesem Gerät merken',
    loggedInAs: 'Angemeldet als',
    alertButton: 'Alarmmeldung 6 senden',
    dangerButton: 'aktuelle Gefahr',
    dangerOnly: 'Nur für registrierte Nutzer',
    dangerRegistrationHint: 'Registrierung erforderlich',
    emergencyRegistrationHint: 'Firmennutzer-Registrierung erforderlich',
    companyOnlyEmergency: 'Notfall ist nur für registrierte Firmennutzer aktiv.',
    companyAlertSelectHint: 'Bitte Art der Notfallmeldung auswählen.',
    companyModeTitle: 'Einsatzmodus',
    companyModeSubtitle: 'Professionelle Oberfläche: Gefahren melden, Teamlage prüfen, aktuelle Meldungen auf der Karte ansteuern.',
    companyQuickActions: 'Sofortmeldung',
    companyGeneralDanger: 'Aktuelle Gefahr 6 melden',
    companyCategories: 'Gefahrenart auswählen',
    companyPublicRatings: 'Lagebewertung 5 bis 1',
    alertHint: 'Diese Meldung ist nachvollziehbar und für registrierte Nutzer sichtbar.',
    alertPlaceholder: 'Kurzbeschreibung, z. B. Unfall oder Gefahr',
    companyTools: 'Gefahrenmeldung',
    companyOverview: 'Einsatzübersicht',
    activeAlerts24: 'Gefahren letzte 24h',
    visibleTeam: 'sichtbare Teamstandorte',
    ownLocationStatus: 'Eigener Standort',
    showNextAlert: 'Aktuelle Gefahr zeigen',
    exportData: 'Export CSV',
    responseChain: 'Rettungskette',
    responseChainText: 'Lage prüfen, Team warnen, bei akuter Gefahr 110 anrufen. Meldung kurz, sachlich und ohne unnötige Personendaten erfassen.',
    recentCompanyAlerts: 'Letzte Firmenmeldungen',
    noCompanyAlerts: 'Noch keine Firmenmeldungen',
    privateTools: 'Privatkonto',
    memberLocations: 'Aktuelle Team-Standorte',
    shareMyLocation: 'Meinen Standort teilen',
    focusMember: 'Anzeigen',
    lastSeen: 'zuletzt',
    sharingOn: 'Standort wird geteilt',
    sharingOff: 'Standort wird nicht geteilt',
    companyNoMembers: 'Teamstandorte anzeigen',
    alertSent: 'Alarmmeldung wurde ausgelost.',
    alertPoll: 'Neue Alarmmeldung',
    loginFailed: 'Login fehlgeschlagen.',
    police: 'Polizei',
    hospital: 'Krankenhaus',
    mapPopupReports: 'Meldungen',
    mapPopupAverage: 'Durchschnitt',
    funLabels: {
      first_kiss: 'Erster Kuss',
      sport_success: 'Großter sportlicher Erfolg',
      best_recovery: 'Beste Erholung',
      kind_people: 'Nette Menschen',
      interesting_area: 'Interessante Umgebung'
    },
    funSetHint: 'Fun-Ort gesetzt. Jetzt ein Fun-Symbol wählen.',
    alertTypes: {
      general: 'Allgemeiner Alarm',
      gun: 'Schusswaffe',
      knife: 'Messer',
      violence: 'Gewalt',
      mob: 'Mob'
    },
    tickerScores: {
      1: 'Sehr schön',
      2: 'Schön',
      3: 'Neutral',
      4: 'Nicht schön',
      5: 'Schlecht',
      6: 'Aktuelle Gefahr'
    },
    scores: {
      1: 'Sehr gut',
      2: 'Gut',
      3: 'Neutral',
      4: 'Schlecht',
      5: 'Sehr schlecht'
    }
  },
  en: {
    defaultView: 'Default: this year',
    brandClaim: 'Move safely. Share good places.',
    heroTitle: 'Safe or not? Where does it feel good?',
    heroCopy: 'Share in seconds how a place feels right now. The map shows beautiful, neutral and unsafe areas without exposing individual shops or private people.',
    locateMe: 'My location',
    locateActionHint: 'allow · center · show',
    todayMode: 'Today',
    thisWeek: 'This week',
    thisMonth: 'This month',
    thisYear: 'This year',
    search: 'Search',
    yourPosition: 'Your location',
    noPosition: 'Not set yet',
    locating: 'Locating...',
    currentMode: 'View',
    quickRate: 'Quick rate',
    radiusHint: 'Automatically rounded to 100 m',
    funMode: 'Had fun?',
    funModeHint: 'Open fun ratings',
    funModeHintOpen: 'Close fun ratings',
    ratingInvite: 'How is it here? Share it with others:',
    emergency: 'Emergency',
    emergencyInfo: 'Company accounts only',
    emergencyCall: 'In immediate danger: 110',
    needSecurity: 'I need more safety',
    orientation: 'Current reports',
    currentReports: 'Current reports',
    currentAlertSingular: 'current report',
    currentAlertPlural: 'current reports',
    noCurrentAlerts: 'No current reports',
    reportSingular: 'report',
    reportPlural: 'reports',
    last24Hours: 'last 24 hours',
    showOnMap: 'Show',
    filterActive: 'Filter active',
    filterEnded: 'Filter hidden again',
    alertsTitle: 'Registered users',
    logout: 'Logout',
    adTitle: 'biss-berlin.com',
    bannerCopy: 'Presented by Berliner Initiative sichere Stadt e.V.',
    designClassic: 'Classic design',
    designFriendly: 'Friendly design',
    excellentNearby: 'Arrows point to the next very well rated area',
    centerMap: 'Center',
    searchPlaceholder: 'Search place or try: Alexanderplatz',
    viewYear: 'This year',
    viewMonth: 'This month',
    viewWeek: 'This week',
    viewToday: 'Today',
    locateError: 'Could not determine location.',
    secureContext: 'Geolocation requires HTTPS or localhost.',
    searching: 'Searching...',
    noSearchResults: 'Place not found. Please try a more specific search.',
    selectLocationFirst: 'Please set your location first.',
    ratingSaved: 'Rating saved.',
    ratingBlocked: 'Please wait a bit before rating the same area again.',
    funSaved: 'Fun marker saved.',
    emergencyOn: 'Emergency arrows to police and hospital are visible.',
    emergencyOff: 'Emergency overlay hidden again.',
    loadingArea: 'Loading nearby area...',
    noAreaData: 'No data inside the 100 meter radius yet.',
    yearSummary: 'Average last year',
    todaySummary: 'Average last 7 days',
    noData: 'No data',
    nearestExcellent: 'Next top-rated area',
    nearestPolice: 'Nearest police station',
    nearestHospital: 'Nearest hospital',
    loginIntro: 'Demo login for private and company users. Roles decide which safety controls become visible.',
    privateAccess: 'Private access',
    companyAccess: 'Company access',
    privateDemo: 'Private demo: anna / 12345ab',
    companyDemo: 'Company demo: safeguard1 / 24680sg',
    loginCode: 'Login code',
    loginPin: 'PIN',
    loginSubmit: 'Log in',
    rememberLogin: 'Remember login details on this device',
    loggedInAs: 'Logged in as',
    alertButton: 'Send alert 6',
    dangerButton: 'current danger',
    dangerOnly: 'Registered users only',
    dangerRegistrationHint: 'Registration required',
    emergencyRegistrationHint: 'Company registration required',
    companyOnlyEmergency: 'Emergency is only active for registered company users.',
    companyAlertSelectHint: 'Please choose the type of emergency report.',
    companyModeTitle: 'Operations mode',
    companyModeSubtitle: 'Professional interface: report danger, check team status and jump to current alerts on the map.',
    companyQuickActions: 'Immediate report',
    companyGeneralDanger: 'Report current danger 6',
    companyCategories: 'Choose danger type',
    companyPublicRatings: 'Area rating 5 to 1',
    alertHint: 'This report is attributable and visible to registered users.',
    alertPlaceholder: 'Short note, e.g. accident or threat',
    companyTools: 'Danger report',
    companyOverview: 'Operations overview',
    activeAlerts24: 'Dangers last 24h',
    visibleTeam: 'visible team locations',
    ownLocationStatus: 'Own location',
    showNextAlert: 'Show current danger',
    exportData: 'Export CSV',
    responseChain: 'Response chain',
    responseChainText: 'Check the situation, warn the team, call 110 in immediate danger. Keep reports short, factual and free of unnecessary personal data.',
    recentCompanyAlerts: 'Recent company reports',
    noCompanyAlerts: 'No company reports yet',
    privateTools: 'Private account',
    memberLocations: 'Current team locations',
    shareMyLocation: 'Share my location',
    focusMember: 'Show',
    lastSeen: 'last seen',
    sharingOn: 'Location is shared',
    sharingOff: 'Location is not shared',
    companyNoMembers: 'Show team locations',
    alertSent: 'Alert has been triggered.',
    alertPoll: 'New alert',
    loginFailed: 'Login failed.',
    police: 'Police',
    hospital: 'Hospital',
    mapPopupReports: 'Reports',
    mapPopupAverage: 'Average',
    funLabels: {
      first_kiss: 'First kiss',
      sport_success: 'Biggest sports success',
      best_recovery: 'Best recovery',
      kind_people: 'Kind people',
      interesting_area: 'Interesting surroundings'
    },
    funSetHint: 'Fun spot set. Now choose a fun symbol.',
    alertTypes: {
      general: 'General alert',
      gun: 'Firearm',
      knife: 'Knife',
      violence: 'Violence',
      mob: 'Mob'
    },
    tickerScores: {
      1: 'Very nice',
      2: 'Nice',
      3: 'Neutral',
      4: 'Not nice',
      5: 'Bad',
      6: 'Current danger'
    },
    scores: {
      1: 'Very good',
      2: 'Good',
      3: 'Neutral',
      4: 'Poor',
      5: 'Very poor'
    }
  }
};

const scoreDefinitions = [1, 2, 3, 4, 5];
const funTags = ['first_kiss', 'sport_success', 'best_recovery', 'kind_people', 'interesting_area'];
const companyAlertTypes = ['gun', 'knife', 'violence', 'mob'];
const funIcons = {
  first_kiss: '💋',
  sport_success: '🏆',
  best_recovery: '🌿',
  kind_people: '😊',
  interesting_area: '✨'
};

const map = L.map('map', {
  zoomControl: false,
  preferCanvas: true
}).setView([52.52, 13.405], 12);

L.control.zoom({ position: 'bottomright' }).addTo(map);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const layers = {
  cells: L.layerGroup().addTo(map),
  effects: L.layerGroup().addTo(map),
  alerts: L.layerGroup().addTo(map),
  emergency: L.layerGroup().addTo(map),
  fun: L.layerGroup().addTo(map),
  people: L.layerGroup().addTo(map),
  arrows: L.layerGroup().addTo(map)
};

let userMarker = null;
let watchId = null;
let latestAlertId = '';
let pollTimer = null;

const languageToggle = document.getElementById('languageToggle');
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const loginPopover = document.getElementById('loginPopover');
const registeredPanel = document.getElementById('registeredPanel');
const locateBtn = document.getElementById('locateBtn');
const currentAlertsBtn = document.getElementById('currentAlertsBtn');
const mainDangerBtn = document.getElementById('mainDangerBtn');
const funToggle = document.getElementById('funToggle');
const viewSwitcher = document.getElementById('viewSwitcher');
const submitStatus = document.getElementById('submitStatus');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const ratingButtons = document.getElementById('ratingButtons');
const funButtons = document.getElementById('funButtons');
const legendList = document.getElementById('legendList');
const areaSummary = document.getElementById('areaSummary');
const authPanel = document.getElementById('authPanel');
const companyPanel = document.getElementById('companyPanel');
const alertStrip = document.getElementById('alertStrip');
const companyTicker = document.getElementById('companyTicker');
const mapPanel = document.querySelector('.map-panel');
const reportTicker = document.getElementById('reportTicker');
const consentBanner = document.getElementById('consentBanner');
const comfortConsentInput = document.getElementById('comfortConsentInput');
const necessaryConsentBtn = document.getElementById('necessaryConsentBtn');
const saveConsentBtn = document.getElementById('saveConsentBtn');
const acceptComfortBtn = document.getElementById('acceptComfortBtn');
const cookieSettingsBtn = document.getElementById('cookieSettingsBtn');
const designToggleBtn = document.getElementById('designToggleBtn');

const viewOptions = ['today', 'week', 'month', 'year'];

function t(key) {
  const lang = texts[state.language];
  return key.split('.').reduce((value, part) => value && value[part], lang) || key;
}

function showConsentBanner(force = false) {
  const consent = storedConsent();
  if (!force && consent) return;
  comfortConsentInput.checked = consent?.comfort === true;
  consentBanner.classList.remove('hidden');
}

function saveConsent(comfort) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify({
    necessary: true,
    comfort,
    savedAt: new Date().toISOString()
  }));

  if (!comfort) {
    cleanupComfortStorage();
    state.language = 'de';
    state.shareCompanyLocation = true;
    state.designMode = 'friendly';
  } else {
    rememberComfortValue('sicherodernicht-language', state.language);
    rememberComfortValue('sicherodernicht-share-company-location', state.shareCompanyLocation ? 'on' : 'off');
    rememberComfortValue(DESIGN_KEY, state.designMode);
  }

  consentBanner.classList.add('hidden');
  applyDesignMode();
  updateTranslations();
}

function applyDesignMode() {
  document.body.classList.toggle('design-classic', state.designMode === 'classic');
  document.body.classList.toggle('design-friendly', state.designMode !== 'classic');
  if (designToggleBtn) {
    designToggleBtn.textContent = state.designMode === 'classic' ? t('designFriendly') : t('designClassic');
  }
}

function applyUserMode() {
  const isCompany = state.user?.role === 'company';
  document.body.classList.toggle('company-mode', isCompany);
  if (isCompany && state.funMode) {
    state.funMode = false;
    state.pendingFunPos = null;
    layers.fun.clearLayers();
  }
}

function toggleDesignMode() {
  state.designMode = state.designMode === 'classic' ? 'friendly' : 'classic';
  sessionStorage.setItem(DESIGN_KEY, state.designMode);
  rememberComfortValue(DESIGN_KEY, state.designMode);
  applyDesignMode();
  window.setTimeout(() => map.invalidateSize(), 120);
}

function scoreColor(score) {
  if (score <= 1.5) return '#00b16a';
  if (score <= 2.5) return '#57c785';
  if (score <= 3.5) return '#ffbf47';
  if (score <= 4.5) return '#f97316';
  return '#ef4444';
}

function circleOpacityForZoom() {
  const zoom = map.getZoom();
  const normalized = Math.max(0, Math.min(1, (zoom - 10) / 8));
  return {
    fillOpacity: Number((0.005 + normalized * 0.34).toFixed(3)),
    opacity: Number((0.04 + normalized * 0.56).toFixed(3))
  };
}

function updateCircleOpacity() {
  const { cloudAlpha, cloudSize } = ratingCloudMetricsForZoom();
  state.cellCircles.forEach((cloud) => {
    const element = cloud.getElement?.()?.querySelector('.rating-cloud-visual');
    if (!element) return;
    element.style.setProperty('--cloud-alpha', cloudAlpha);
    element.style.setProperty('--cloud-size', `${cloudSize}px`);
  });
}

function seededUnit(seed) {
  let hash = 2166136261;
  String(seed).split('').forEach((char) => {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  });
  return (hash >>> 0) / 4294967295;
}

function offsetLatLng(lat, lng, northMeters, eastMeters) {
  const latOffset = northMeters / 111320;
  const lngOffset = eastMeters / (111320 * Math.cos((lat * Math.PI) / 180) || 1);
  return [lat + latOffset, lng + lngOffset];
}

function ratingCloudAnchor(cell) {
  const seed = cell.cellId || `${cell.lat}:${cell.lng}:${cell.averageScore}`;
  const angle = seededUnit(`${seed}:label-angle`) * Math.PI * 2;
  const distance = 18 + seededUnit(`${seed}:label-distance`) * 22;
  return offsetLatLng(cell.lat, cell.lng, Math.sin(angle) * distance, Math.cos(angle) * distance);
}

function ratingCloudMetricsForZoom() {
  const zoom = map.getZoom();
  const normalized = Math.max(0, Math.min(1, (zoom - 10) / 8));
  return {
    cloudAlpha: Number((0.16 + normalized * 0.46).toFixed(3)),
    cloudSize: Math.round(46 + normalized * 98)
  };
}

function ratingCloudIcon(cell) {
  const seed = cell.cellId || `${cell.lat}:${cell.lng}:${cell.averageScore}`;
  const { cloudAlpha, cloudSize } = ratingCloudMetricsForZoom();
  const color = scoreColor(cell.averageScore);
  const delay = Number((seededUnit(`${seed}:delay`) * 7).toFixed(2));
  const rotate = Math.round((seededUnit(`${seed}:rotate`) - 0.5) * 14);
  return iconHtml(
    `<div class="rating-cloud-visual" style="--cloud-color:${color}; --cloud-alpha:${cloudAlpha}; --cloud-size:${cloudSize}px; --cloud-delay:-${delay}s; --cloud-rotate:${rotate}deg"></div>`,
    'rating-cloud-marker',
    [cloudSize, Math.round(cloudSize * 0.68)],
    [Math.round(cloudSize * 0.5), Math.round(cloudSize * 0.34)]
  );
}

function markerDetailLevel() {
  const zoom = map.getZoom();
  if (zoom < 13) return 'far';
  if (zoom < 16) return 'mid';
  return 'near';
}

function markerContent(cell, displayScore) {
  const level = markerDetailLevel();
  const isExcellent = cell.averageScore <= 1.5;
  const isDanger = cell.averageScore >= 4.5;

  if (level === 'far') {
    return {
      className: 'marker-far',
      face: '',
      hint: ''
    };
  }

  if (level === 'mid') {
    return {
      className: 'marker-mid',
      face: isExcellent ? '1' : isDanger ? '5' : Math.round(displayScore),
      hint: ''
    };
  }

  return {
    className: 'marker-near',
    face: isExcellent ? '💃🕺' : isDanger ? '😢' : displayScore,
    hint: `<span class="cell-hint">${cell.count}</span>`
  };
}

function formatDate(value) {
  return new Date(value).toLocaleString(state.language === 'de' ? 'de-DE' : 'en-US');
}

function formatCoords(lat, lng) {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

function formatDistance(meters) {
  if (!Number.isFinite(meters)) return '';
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function showStatus(message) {
  submitStatus.textContent = message;
}

function iconHtml(content, className, size = [70, 70], anchor = [35, 35]) {
  return L.divIcon({
    className,
    html: content,
    iconSize: size,
    iconAnchor: anchor
  });
}

function distanceMeters(lat1, lng1, lat2, lng2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const latDiff = toRad(lat2 - lat1);
  const lngDiff = toRad(lng2 - lng1);
  const a =
    Math.sin(latDiff / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(lngDiff / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bearingDeg(start, end) {
  const y = Math.sin((end.lng - start.lng) * Math.PI / 180) * Math.cos(end.lat * Math.PI / 180);
  const x =
    Math.cos(start.lat * Math.PI / 180) * Math.sin(end.lat * Math.PI / 180) -
    Math.sin(start.lat * Math.PI / 180) * Math.cos(end.lat * Math.PI / 180) * Math.cos((end.lng - start.lng) * Math.PI / 180);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function pointBetween(start, end, fraction) {
  return {
    lat: start.lat + (end.lat - start.lat) * fraction,
    lng: start.lng + (end.lng - start.lng) * fraction
  };
}

function updateTranslations() {
  document.documentElement.lang = state.language;
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  applyDesignMode();
  applyUserMode();
  searchInput.placeholder = t('searchPlaceholder');
  languageToggle.innerHTML = state.language === 'de' ? '<span>🇩🇪</span><span>DE</span>' : '<span>🇬🇧</span><span>EN</span>';
  loginButton.textContent = state.user ? state.user.name : 'Login';
  renderViewSwitcher();
  renderLegend();
  renderRatingButtons();
  renderFunButtons();
  updateFunToggleState();
  updateDangerButtonState();
  renderLoginPopover();
  renderAuthPanel();
  renderReportTicker();
  renderCompanyTicker();
  renderAreaSummary();
}

function updateFunToggleState() {
  funToggle.classList.toggle('is-active', state.funMode);
  funToggle.setAttribute('aria-expanded', state.funMode ? 'true' : 'false');

  const hint = funToggle.querySelector('.fun-invite-sub');
  const arrow = funToggle.querySelector('.fun-invite-arrow');
  if (hint) {
    hint.textContent = state.funMode ? t('funModeHintOpen') : t('funModeHint');
  }
  if (arrow) {
    arrow.textContent = state.funMode ? '⌃' : '⌄';
  }
}

function updateDangerButtonState() {
  const note = mainDangerBtn.querySelector('.score-note');
  mainDangerBtn.classList.toggle('is-locked', !state.user);
  if (note) {
    note.textContent = state.user ? t('alertHint') : t('dangerOnly');
  }
}

async function toggleCompanyLocationSharing() {
  state.shareCompanyLocation = !state.shareCompanyLocation;
  rememberComfortValue('sicherodernicht-share-company-location', state.shareCompanyLocation ? 'on' : 'off');
  renderAuthPanel();

  if (!state.shareCompanyLocation && state.token) {
    await api('/api/location', {
      method: 'POST',
      body: JSON.stringify({ token: state.token, share: false })
    }).catch(() => {});
    await loadProfile().catch(() => {});
    showStatus(t('sharingOff'));
    return;
  }

  if (state.shareCompanyLocation && state.token && state.userPos) {
    await api('/api/location', {
      method: 'POST',
      body: JSON.stringify({ token: state.token, lat: state.userPos.lat, lng: state.userPos.lng, share: true })
    }).catch(() => {});
    await loadProfile().catch(() => {});
  }
  showStatus(state.shareCompanyLocation ? t('sharingOn') : t('sharingOff'));
}

function currentDangerAlerts() {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  return (state.mapData?.alerts || [])
    .filter((entry) => new Date(entry.createdAt).getTime() >= cutoff)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function updateCurrentAlertsButton() {
  const isCompany = state.user?.role === 'company';
  const alerts = currentDangerAlerts();
  currentAlertsBtn.classList.toggle('hidden', !isCompany || !alerts.length);
  if (!isCompany || !alerts.length) return;

  const label = alerts.length === 1 ? t('currentAlertSingular') : t('currentAlertPlural');
  currentAlertsBtn.textContent = `${alerts.length} ${label}`;
  currentAlertsBtn.disabled = false;
}

function playCompanyAlertSound() {
  if (state.user?.role !== 'company') return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const context = new AudioContext();
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.42);
  gain.connect(context.destination);

  [0, 0.16].forEach((offset) => {
    const oscillator = context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, context.currentTime + offset);
    oscillator.connect(gain);
    oscillator.start(context.currentTime + offset);
    oscillator.stop(context.currentTime + offset + 0.12);
  });

  window.setTimeout(() => context.close().catch(() => {}), 700);
}

function focusNextCurrentAlert() {
  const alerts = currentDangerAlerts();
  if (!alerts.length) {
    showStatus(t('noCurrentAlerts'));
    updateCurrentAlertsButton();
    return;
  }

  state.currentAlertIndex = (state.currentAlertIndex + 1) % alerts.length;
  const alert = alerts[state.currentAlertIndex];
  map.flyTo([alert.lat, alert.lng], Math.max(map.getZoom(), 16), { duration: 0.65 });
  showStatus(`${t('alertPoll')}: ${t(`alertTypes.${alert.alertType}`) || t('alertTypes.general')}`);
  mapPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderReportTicker() {
  if (!state.tickerItems.length) {
    reportTicker.classList.add('hidden');
    reportTicker.innerHTML = '';
    return;
  }

  const tickerCategory = (item) => {
    if (item.categoryType === 'summary' && item.score) {
      const label = item.score === 6 ? t(`tickerScores.${item.score}`) : t(`scores.${item.score}`);
      const category = label.charAt(0).toLowerCase() + label.slice(1);
      return `${t('reportPlural')} ${category}: ${item.count}`;
    }
    if (item.categoryType === 'score' && item.score) {
      return `${item.score} - ${t(`scores.${item.score}`)}`;
    }
    if (item.categoryType === 'alert') {
      if (item.alertType === 'general') {
        return `6 - ${t('alertTypes.general')}`;
      }
      return `${t('emergency')} - ${t(`alertTypes.${item.alertType}`)}`;
    }
    return item.label || '';
  };

  const repeated = [...state.tickerItems, ...state.tickerItems];
  reportTicker.classList.remove('hidden');
  reportTicker.innerHTML = `
    <div class="report-ticker-track">
      ${repeated
        .map(
          (item) => `
            <span class="report-chip ${item.isCritical ? 'is-critical' : ''}">
              <strong>${tickerCategory(item)}</strong>
              ${item.categoryType === 'summary' ? `<span class="report-time">${t('todayMode')}</span>` : `<span>${item.place || item.message || t('noAreaData')}</span><span class="report-time">${formatDate(item.createdAt)}</span>`}
            </span>
          `
        )
        .join('')}
    </div>
  `;
}

function renderLoginPopover() {
  if (state.user) {
    loginPopover.classList.add('hidden');
    loginPopover.innerHTML = '';
    return;
  }

  const savedCode = hasComfortConsent() ? localStorage.getItem('sicherodernicht-login-code') || '' : '';
  const savedPin = hasComfortConsent() ? localStorage.getItem('sicherodernicht-login-pin') || '' : '';
  const hasSavedLogin = Boolean(savedCode || savedPin);

  loginPopover.innerHTML = `
    <div class="login-grid">
      <input id="loginCode" placeholder="${t('loginCode')}" autocomplete="username" value="${savedCode}" />
      <input id="loginPin" placeholder="${t('loginPin')}" autocomplete="current-password" inputmode="text" value="${savedPin}" />
      <label class="remember-login">
        <input id="rememberLogin" type="checkbox" ${hasSavedLogin ? 'checked' : ''} />
        <span>${t('rememberLogin')}</span>
      </label>
      <button id="loginSubmit" class="primary-button" type="button">${t('loginSubmit')}</button>
    </div>
  `;

  const submit = document.getElementById('loginSubmit');
  if (submit) {
    submit.addEventListener('click', submitLogin);
  }
}

function renderViewSwitcher() {
  viewSwitcher.innerHTML = '';
  const labels = {
    today: t('todayMode'),
    week: t('thisWeek'),
    month: t('thisMonth'),
    year: t('thisYear')
  };

  viewOptions.forEach((view) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `view-button ${state.currentView === view ? 'is-active' : ''}`;
    button.textContent = labels[view];
    button.addEventListener('click', () => setView(view));
    viewSwitcher.appendChild(button);
  });
}

function renderLegend() {
  legendList.innerHTML = '';
  [...scoreDefinitions, 6].forEach((score) => {
    const remaining = state.legendFilter?.score === score ? state.legendFilter.remaining : 0;
    const item = document.createElement('div');
    item.className = `legend-item ${remaining ? 'is-filtering' : ''}`;
    item.innerHTML = `
      <span class="legend-badge">
        <span class="legend-swatch legend-${score}" aria-hidden="true"></span>
      </span>
      <span>${score === 6 ? t('tickerScores.6') : t(`scores.${score}`)}</span>
      <button type="button" class="legend-show-button" data-score="${score}">
        ${remaining ? `${remaining}s` : t('showOnMap')}
      </button>
    `;
    legendList.appendChild(item);
  });

  legendList.querySelectorAll('.legend-show-button').forEach((button) => {
    button.addEventListener('click', () => startLegendFilter(Number(button.dataset.score)));
  });
}

function renderRatingButtons() {
  ratingButtons.innerHTML = '';
  scoreDefinitions.forEach((score) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `score-button score-${score}`;
    button.dataset.label = t(`scores.${score}`);
    button.textContent = score;
    button.addEventListener('click', () => submitRating(score));
    ratingButtons.appendChild(button);
  });
}

function stopLegendFilter(announce = false) {
  if (state.legendFilter?.timerId) {
    clearInterval(state.legendFilter.timerId);
  }
  state.legendFilter = null;
  renderLegend();
  renderMap();
  drawGuidance();
  if (announce) {
    showStatus(t('filterEnded'));
  }
}

async function startLegendFilter(score) {
  if (![1, 2, 3, 4, 5, 6].includes(score)) return;

  if (state.legendFilter?.timerId) {
    clearInterval(state.legendFilter.timerId);
  }

  const data = await api(`/api/legend-filter?score=${score}`);
  state.legendFilter = {
    score,
    remaining: 10,
    data,
    timerId: null
  };

  showStatus(`${t('filterActive')}: ${score === 6 ? t('tickerScores.6') : t(`scores.${score}`)}`);
  renderLegend();
  renderMap();

  state.legendFilter.timerId = setInterval(() => {
    if (!state.legendFilter || state.legendFilter.score !== score) return;
    state.legendFilter.remaining -= 1;
    if (state.legendFilter.remaining <= 0) {
      stopLegendFilter(true);
      return;
    }
    renderLegend();
  }, 1000);
}

function renderFunButtons() {
  funButtons.innerHTML = '';
  funTags.forEach((tag) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'fun-button';
    button.innerHTML = `
      <span class="fun-button-icon">${funIcons[tag]}</span>
      <span class="fun-button-text">${t(`funLabels.${tag}`)}</span>
    `;
    button.addEventListener('click', () => submitFun(tag));
    funButtons.appendChild(button);
  });
}

function renderCompanyTicker() {
  const companies = state.mapData?.companies || [];
  const repeated = [...companies, ...companies];
  companyTicker.innerHTML = `
    <div class="company-ticker-track">
      ${repeated
        .map(
          (company) => `
            <span class="ticker-logo">
              <span class="ticker-mark" style="background:${company.color}">${company.logoText}</span>
              <span>${company.name}</span>
            </span>
          `
        )
        .join('')}
    </div>
  `;
}

function renderSearchResults() {
  searchResults.innerHTML = '';
  if (!state.searchResults.length) return;
  state.searchResults.forEach((result) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'search-result-button';
    button.textContent = result.label;
    button.addEventListener('click', () => {
      setUserPosition(result.lat, result.lng, false);
      map.flyTo([result.lat, result.lng], 16, { duration: 0.6 });
      state.searchResults = [];
      renderSearchResults();
      loadAreaSummary();
    });
    searchResults.appendChild(button);
  });
}

async function geocodePlaces(query) {
  const language = state.language === 'de' ? 'de' : 'en';
  const endpoint = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&accept-language=${language}&q=${encodeURIComponent(query)}`;

  const response = await fetch(endpoint, {
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('geocode_failed');
  }

  const results = await response.json();
  if (!Array.isArray(results)) return [];

  return results.map((entry, index) => ({
    id: `geo-${index}-${entry.place_id || entry.osm_id || Date.now()}`,
    label: entry.display_name,
    lat: Number(entry.lat),
    lng: Number(entry.lon)
  })).filter((entry) => Number.isFinite(entry.lat) && Number.isFinite(entry.lng));
}

function renderAreaSummary() {
  if (!state.areaData) {
    areaSummary.innerHTML = '';
    return;
  }

  const yearScore = state.areaData.year.averageScore ?? t('noData');
  const todayScore = state.areaData.today.averageScore ?? t('noData');
  const excellent = state.areaData.nearestExcellent
    ? `${Math.round(distanceMeters(state.userPos.lat, state.userPos.lng, state.areaData.nearestExcellent.lat, state.areaData.nearestExcellent.lng))} m`
    : t('noData');
  const police = state.areaData.nearestPolice
    ? `${state.areaData.nearestPolice.name}`
    : t('noData');
  const hospital = state.areaData.nearestHospital
    ? `${state.areaData.nearestHospital.name}`
    : t('noData');

  areaSummary.innerHTML = `
    <div class="summary-box"><strong>${t('yearSummary')}</strong><br>${yearScore}</div>
    <div class="summary-box"><strong>${t('todaySummary')}</strong><br>${todayScore}</div>
    <div class="summary-box"><strong>${t('nearestExcellent')}</strong><br>${excellent}</div>
    <div class="summary-box"><strong>${t('nearestPolice')}</strong><br>${police}</div>
    <div class="summary-box"><strong>${t('nearestHospital')}</strong><br>${hospital}</div>
  `;
}

function renderCompanyAlertList() {
  const alerts = [...state.companyAlerts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  if (!alerts.length) {
    return `<div class="member-row team-locations-empty">${t('noCompanyAlerts')}</div>`;
  }

  return alerts
    .map(
      (alert) => `
        <div class="company-feed-row">
          <strong>${t(`alertTypes.${alert.alertType}`) || t('alertTypes.general')}</strong>
          <span>${formatDate(alert.createdAt)}</span>
          ${alert.note ? `<small>${escapeHtml(alert.note)}</small>` : ''}
        </div>
      `
    )
    .join('');
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\n\r;]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function downloadCompanyCsv() {
  const rows = [
    ['createdAt', 'category', 'reporterName', 'companyName', 'lat', 'lng', 'note'],
    ...state.companyAlerts.map((alert) => [
      alert.createdAt,
      t(`alertTypes.${alert.alertType}`) || alert.alertType || 'general',
      alert.reporter?.name || '',
      alert.reporter?.companyName || state.user?.companyName || '',
      alert.lat,
      alert.lng,
      alert.note || ''
    ])
  ];
  const csv = rows.map((row) => row.map(csvCell).join(';')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sicherodernicht-firmenmeldungen-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function renderAuthPanel() {
  applyUserMode();
  registeredPanel.classList.toggle('hidden', !(state.user && state.user.role === 'company'));
  logoutButton.classList.add('hidden');
  updateDangerButtonState();
  if (!state.user) {
    authPanel.innerHTML = '';
    companyPanel.classList.add('hidden');
    companyPanel.innerHTML = '';
    return;
  }

  authPanel.innerHTML = '';

  if (state.user.role === 'company') {
    const currentAlerts = currentDangerAlerts();
    const visibleMembers = state.companyMembers.filter((member) => member.location).length;
    const totalMembers = state.companyMembers.length;
    companyPanel.classList.remove('hidden');
    companyPanel.innerHTML = `
      <div class="company-mode-header">
        <strong>${t('companyModeTitle')}</strong>
      </div>

      <section class="company-overview-card company-status-card">
        <div class="panel-head">
          <strong>${t('companyOverview')}</strong>
          <span class="company-live-pill">${currentAlerts.length} / 24h</span>
        </div>
        <div class="company-metrics">
          <div><strong>${currentAlerts.length}</strong><span>${t('activeAlerts24')}</span></div>
          <div><strong>${visibleMembers}/${totalMembers}</strong><span>${t('visibleTeam')}</span></div>
          <div><strong>${state.shareCompanyLocation ? 'ON' : 'OFF'}</strong><span>${t('ownLocationStatus')}</span></div>
        </div>
        <div class="company-action-row">
          <button id="panelShowAlertsBtn" class="primary-button" type="button">${t('showNextAlert')}</button>
          <button id="shareLocationToggle" class="share-location-toggle ${state.shareCompanyLocation ? 'is-on' : 'is-off'}" type="button">
            ${t('shareMyLocation')}
          </button>
        </div>
      </section>

      <section class="company-operational-card company-danger-card">
        <div class="panel-head"><strong>${t('companyQuickActions')}</strong></div>
        <div class="login-grid">
          <input id="alertNote" class="alert-note-input" placeholder="${t('alertPlaceholder')}" maxlength="220" />
          <small>${t('alertHint')}</small>
        </div>
        <button id="panelDangerBtn" class="company-primary-alert" type="button">
          <span>6</span>
          <strong>${t('companyGeneralDanger')}</strong>
        </button>
        <div class="company-category-title">${t('companyCategories')}</div>
        <div class="company-alert-grid">
          ${companyAlertTypes
            .map((type) => `<button type="button" class="company-type-btn company-alert-${type}" data-type="${type}">${t(`alertTypes.${type}`)}</button>`)
            .join('')}
        </div>
      </section>

      <section class="company-operational-card company-rating-card">
        <div class="panel-head"><strong>${t('companyPublicRatings')}</strong></div>
        <div class="company-rating-grid">
          ${[5, 4, 3, 2, 1]
            .map((score) => `<button type="button" class="score-button score-${score}" data-company-score="${score}" aria-label="${t(`scores.${score}`)}">${score}</button>`)
            .join('')}
        </div>
      </section>

      <section class="company-operational-card">
        <div class="team-location-header">
          <strong>${t('memberLocations')}</strong>
        </div>
        <div id="memberList" class="company-member-list"></div>
      </section>

      <section class="company-operational-card">
        <div class="panel-head"><strong>${t('recentCompanyAlerts')}</strong></div>
        <div class="company-feed-list">${renderCompanyAlertList()}</div>
      </section>
    `;

    document.getElementById('panelShowAlertsBtn')?.addEventListener('click', focusNextCurrentAlert);
    document.getElementById('panelDangerBtn')?.addEventListener('click', () => submitAlert('general'));
    companyPanel.querySelectorAll('.company-type-btn').forEach((button) => {
      button.addEventListener('click', () => submitAlert(button.dataset.type));
    });
    companyPanel.querySelectorAll('[data-company-score]').forEach((button) => {
      button.addEventListener('click', () => submitRating(Number(button.dataset.companyScore)));
    });
    document.getElementById('shareLocationToggle')?.addEventListener('click', toggleCompanyLocationSharing);

    const memberList = document.getElementById('memberList');
    memberList.innerHTML = '';
    if (!state.companyMembers.length) {
      memberList.innerHTML = `<div class="member-row team-locations-empty">${t('companyNoMembers')}</div>`;
    } else {
      state.companyMembers.forEach((member) => {
        const row = document.createElement('div');
        row.className = 'member-row';
        const distance = state.userPos && member.location
          ? formatDistance(distanceMeters(state.userPos.lat, state.userPos.lng, member.location.lat, member.location.lng))
          : '';
        const updated = member.location?.updatedAt ? formatDate(member.location.updatedAt) : '-';
        row.innerHTML = `
          <span class="member-main">
            <strong>${escapeHtml(member.name)}</strong>
            <small>${distance ? `${escapeHtml(distance)} · ` : ''}${t('lastSeen')} ${escapeHtml(updated)}</small>
          </span>
          ${
            member.location
              ? `<button class="ghost-button tiny member-focus-btn" data-member-id="${escapeHtml(member.id)}" type="button">${t('focusMember')}</button>`
              : '<span class="member-offline">-</span>'
          }
        `;
        memberList.appendChild(row);
      });
      memberList.querySelectorAll('.member-focus-btn').forEach((button) => {
        button.addEventListener('click', () => {
          const member = state.companyMembers.find((entry) => entry.id === button.dataset.memberId);
          if (member?.location) {
            map.flyTo([member.location.lat, member.location.lng], Math.max(map.getZoom(), 16), { duration: 0.55 });
          }
        });
      });
    }
  } else {
    companyPanel.classList.add('hidden');
    companyPanel.innerHTML = '';
  }
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) {
    throw payload || new Error(`HTTP ${response.status}`);
  }
  return payload;
}

function setUserPosition(lat, lng, announce = true) {
  state.userPos = { lat, lng };

  if (!userMarker) {
    userMarker = L.marker([lat, lng], {
      icon: iconHtml('<div class="user-badge-marker">📍</div>', 'user-marker', [46, 46], [23, 23])
    }).addTo(layers.people);
  } else {
    userMarker.setLatLng([lat, lng]);
  }

  if (announce) {
    showStatus(formatCoords(lat, lng));
  }
  drawGuidance();
  const mayShareCompanyLocation = state.user?.role !== 'company' || state.shareCompanyLocation;
  if (state.token && mayShareCompanyLocation) {
    api('/api/location', {
      method: 'POST',
      body: JSON.stringify({ token: state.token, lat, lng, share: true })
    })
      .then(() => {
        if (state.user?.role === 'company') {
          loadProfile().catch(() => {});
        }
      })
      .catch(() => {});
  }

  if (state.followUser) {
    map.setView([lat, lng], Math.max(map.getZoom(), 16), { animate: true });
  }
}

function centerOnUser(lat, lng) {
  state.followUser = true;
  map.setView([lat, lng], Math.max(map.getZoom(), 16), { animate: true });
  map.invalidateSize();
  mapPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function initialsForName(name) {
  return String(name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || '?';
}

function drawGuidance() {
  layers.arrows.clearLayers();
  layers.emergency.clearLayers();

  if (!state.userPos || !state.areaData) return;

  if (state.areaData.nearestExcellent) {
    drawArrowRoute(state.userPos, state.areaData.nearestExcellent, '#ffffff', '→');
  }

  if (state.emergencyMode) {
    if (state.areaData.nearestPolice) {
      drawArrowRoute(state.userPos, state.areaData.nearestPolice, '#93c5fd', '🛡');
    }
    if (state.areaData.nearestHospital) {
      drawArrowRoute(state.userPos, state.areaData.nearestHospital, '#fda4af', '✚');
    }
  }
}

function drawArrowRoute(start, end, color, symbol) {
  L.polyline(
    [
      [start.lat, start.lng],
      [end.lat, end.lng]
    ],
    {
      color,
      weight: 3,
      opacity: 0.36,
      dashArray: '10 12'
    }
  ).addTo(state.emergencyMode && symbol !== '→' ? layers.emergency : layers.arrows);

  const rotation = bearingDeg(start, end);
  [0.25, 0.5, 0.75].forEach((fraction) => {
    const point = pointBetween(start, end, fraction);
    L.marker([point.lat, point.lng], {
      icon: iconHtml(
        `<div class="arrow-badge" style="transform: rotate(${rotation}deg); border-color:${color}; color:${color}">${symbol}</div>`,
        'arrow-marker',
        [32, 32],
        [16, 16]
      )
    }).addTo(state.emergencyMode && symbol !== '→' ? layers.emergency : layers.arrows);
  });
}

function renderMap() {
  layers.cells.clearLayers();
  layers.effects.clearLayers();
  layers.alerts.clearLayers();
  layers.fun.clearLayers();
  if (state.legendFilter) {
    layers.arrows.clearLayers();
    layers.emergency.clearLayers();
  }
  state.cellCircles = [];

  const data = state.legendFilter?.data || state.mapData;
  if (!data) return;
  data.cells.forEach((cell) => {
    const displayScore = Number(cell.averageScore.toFixed(1));
    const markerUi = markerContent(cell, displayScore);
    const cloudMarker = L.marker(ratingCloudAnchor(cell), {
      icon: ratingCloudIcon(cell),
      interactive: false,
      keyboard: false
    }).addTo(layers.effects);
    state.cellCircles.push(cloudMarker);

    const marker = L.marker(ratingCloudAnchor(cell), {
      icon: iconHtml(
        `<div class="cell-bubble ${markerUi.className} ${cell.averageScore <= 1.5 ? 'cell-excellent' : ''} ${cell.averageScore >= 4.5 ? 'cell-danger' : ''}" style="background:${scoreColor(cell.averageScore)}cc; color:${scoreColor(cell.averageScore)}" data-count="${cell.count}">
          <span class="cell-face">${markerUi.face}</span>
          ${markerUi.hint}
        </div>`,
        'cell-marker'
      )
    });
    marker.bindPopup(`
      <strong>${t('mapPopupAverage')}: ${displayScore}</strong><br>
      ${t('mapPopupReports')}: ${cell.count}<br>
      ${formatDate(cell.lastReportAt)}
    `);
    marker.addTo(layers.cells);
  });

  data.funReports.forEach((entry) => {
    if (!state.funMode) return;
    L.marker([entry.lat, entry.lng], {
      icon: iconHtml(
        `<div class="fun-badge"><span class="fun-symbol">${funIcons[entry.tag] || '✨'}</span><span class="fun-label">${t(`funLabels.${entry.tag}`)}</span></div>`,
        'fun-marker',
        [170, 52],
        [32, 40]
      )
    }).addTo(layers.fun);
  });

  if (!state.legendFilter && state.funMode && state.pendingFunPos) {
    L.marker([state.pendingFunPos.lat, state.pendingFunPos.lng], {
      icon: iconHtml(
        `<div class="fun-badge pending"><span class="fun-symbol">📍</span><span class="fun-label">${t('funSetHint')}</span></div>`,
        'fun-marker',
        [190, 56],
        [32, 42]
      )
    }).addTo(layers.fun);
  }

  if (!state.legendFilter) data.emergencyPlaces.forEach((place) => {
    const className = place.kind === 'police' ? 'poi-police' : 'poi-hospital';
    const label = place.kind === 'police' ? '👮' : '✚';
    const marker = L.marker([place.lat, place.lng], {
      icon: iconHtml(`<div class="poi-badge ${className}">${label}</div>`, 'poi-marker', [108, 36], [54, 18])
    });
    marker.bindPopup(`
      <strong>${place.name}</strong><br>
      ${place.address || place.name}
    `);
    marker.addTo(layers.effects);
  });

  data.alerts.forEach((entry) => {
    const companyLogo = entry.companyLogo
      ? `<span class="company-logo-badge" style="background:${entry.companyLogo.color}">${entry.companyLogo.text}</span>`
      : '';
    const marker = L.marker([entry.lat, entry.lng], {
      icon: iconHtml(`<div class="alert-badge">6 ${companyLogo}</div>`, 'alert-marker', [70, 70], [35, 35])
    });
    marker.bindPopup(`
      <strong>${t(`alertTypes.${entry.alertType}`) || t('alertTypes.general')}</strong><br>
      ${entry.reporter.name}<br>
      ${formatDate(entry.createdAt)}<br>
      ${entry.note || ''}
    `);
    marker.addTo(layers.alerts);
  });

  renderCompanyTicker();
  drawCompanyMembers();
  drawGuidance();
}

function drawCompanyMembers() {
  layers.people.clearLayers();

  let drewTeamMember = false;
  if (state.user?.role === 'company') {
    state.companyMembers.forEach((member) => {
      if (!member.location) return;
      drewTeamMember = true;
      const color = member.companyColor || '#2563eb';
      const currentClass = member.id === state.user?.id ? ' is-current' : '';
      const label = initialsForName(member.name);
      L.marker([member.location.lat, member.location.lng], {
        icon: iconHtml(
          `<div class="team-marker${currentClass}" style="--team-color:${color}"><span>${label}</span></div>`,
          'team-user-marker',
          [54, 54],
          [27, 27]
        )
      })
        .bindPopup(`
          <strong>${member.name}</strong><br>
          ${member.companyName || state.user.companyName || t('companyTools')}<br>
          ${formatDate(member.location.updatedAt)}
        `)
        .addTo(layers.people);
    });
  }

  if (drewTeamMember) return;

  state.companyMembers.forEach((member) => {
    if (!member.location || member.id === state.user?.id) return;
    L.marker([member.location.lat, member.location.lng], {
      icon: iconHtml(`<div class="user-badge-marker">👥</div>`, 'user-marker', [46, 46], [23, 23])
    })
      .bindPopup(`${member.name}<br>${formatDate(member.location.updatedAt)}`)
      .addTo(layers.people);
  });

  if (userMarker) {
    userMarker.addTo(layers.people);
  }
}

async function loadMapData() {
  state.mapData = await api(`/api/map-data?view=${state.currentView}`);
  renderMap();
  updateCurrentAlertsButton();
}

async function loadTicker() {
  const tokenPart = state.token ? `?token=${encodeURIComponent(state.token)}` : '';
  const payload = await api(`/api/ticker${tokenPart}`);
  state.tickerItems = payload.items || [];
  renderReportTicker();
}

async function loadAreaSummary() {
  if (!state.userPos) {
    areaSummary.innerHTML = `<div class="summary-box">${t('loadingArea')}</div>`;
    return;
  }
  state.areaData = await api(`/api/area?lat=${state.userPos.lat}&lng=${state.userPos.lng}`);
  renderAreaSummary();
  drawGuidance();
}

async function loadProfile() {
  if (!state.token) {
    state.user = null;
    state.companyMembers = [];
    state.companyAlerts = [];
    renderAuthPanel();
    return;
  }
  try {
    const payload = await api(`/api/me?token=${encodeURIComponent(state.token)}`);
    state.user = payload.user;
    state.companyMembers = payload.companyMembers || [];
    if (state.user?.role === 'company') {
      const feed = await api(`/api/company-feed?token=${encodeURIComponent(state.token)}`).catch(() => null);
      state.companyAlerts = feed?.alerts || [];
    } else {
      state.companyAlerts = [];
    }
    loginButton.textContent = state.user.name;
    updateCurrentAlertsButton();
  } catch {
    state.token = '';
    sessionStorage.removeItem('sicherodernicht-token');
    localStorage.removeItem('sicherodernicht-token');
    state.user = null;
    state.companyMembers = [];
    state.companyAlerts = [];
  }
  renderAuthPanel();
  loadTicker().catch(() => {});
  drawCompanyMembers();
}

async function submitRating(score) {
  if (!state.userPos) {
    showStatus(t('selectLocationFirst'));
    return;
  }
  try {
    await api('/api/rate', {
      method: 'POST',
      body: JSON.stringify({ lat: state.userPos.lat, lng: state.userPos.lng, score })
    });
    showStatus(`${t('ratingSaved')} ${score}/5`);
    await Promise.all([loadMapData(), loadAreaSummary()]);
    await loadTicker();
  } catch (error) {
    showStatus(error.retryAfterMinutes ? t('ratingBlocked') : t('ratingBlocked'));
  }
}

async function submitFun(tag) {
  const targetPos = state.pendingFunPos || state.userPos;
  if (!targetPos) {
    showStatus(t('selectLocationFirst'));
    return;
  }
  await api('/api/fun', {
    method: 'POST',
    body: JSON.stringify({ lat: targetPos.lat, lng: targetPos.lng, tag })
  });
  state.pendingFunPos = null;
  showStatus(t('funSaved'));
  await loadMapData();
  await loadTicker();
}

async function submitLogin() {
  const codeInput = document.getElementById('loginCode');
  const pinInput = document.getElementById('loginPin');
  const rememberInput = document.getElementById('rememberLogin');
  const code = codeInput ? codeInput.value.trim() : '';
  const pin = pinInput ? pinInput.value.trim() : '';
  try {
    const payload = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        code,
        pin,
        lat: state.userPos?.lat,
        lng: state.userPos?.lng
      })
    });
    state.token = payload.token;
    sessionStorage.setItem('sicherodernicht-token', state.token);
    localStorage.removeItem('sicherodernicht-token');
    if (rememberInput?.checked && hasComfortConsent()) {
      localStorage.setItem('sicherodernicht-login-code', code);
      localStorage.setItem('sicherodernicht-login-pin', pin);
    } else {
      localStorage.removeItem('sicherodernicht-login-code');
      localStorage.removeItem('sicherodernicht-login-pin');
    }
    await loadProfile();
    loginPopover.classList.add('hidden');
    showStatus(`${t('loggedInAs')} ${payload.user.name}`);
    startPolling();
  } catch {
    showStatus(t('loginFailed'));
  }
}

async function logout() {
  if (state.token) {
    await api('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ token: state.token })
    }).catch(() => {});
  }
  state.token = '';
  sessionStorage.removeItem('sicherodernicht-token');
  localStorage.removeItem('sicherodernicht-token');
  state.user = null;
  state.companyMembers = [];
  state.companyAlerts = [];
  state.currentAlertIndex = -1;
  loginButton.textContent = 'Login';
  loginPopover.classList.add('hidden');
  renderAuthPanel();
  drawCompanyMembers();
  updateCurrentAlertsButton();
}

function logoutOnAppClose() {
  if (!state.token) return;
  const token = state.token;
  sessionStorage.removeItem('sicherodernicht-token');
  state.token = '';

  const payload = JSON.stringify({ token });
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/auth/logout', new Blob([payload], { type: 'application/json' }));
    return;
  }

  fetch('/api/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true
  }).catch(() => {});
}

async function submitAlert(alertType) {
  if (!state.token || !state.userPos) {
    showStatus(t('selectLocationFirst'));
    return;
  }
  const note = document.getElementById('alertNote')?.value.trim() || '';
  await api('/api/alert', {
    method: 'POST',
    body: JSON.stringify({
      token: state.token,
      lat: state.userPos.lat,
      lng: state.userPos.lng,
      alertType,
      note
    })
  });
  showStatus(`${t('alertSent')} ${t(`alertTypes.${alertType}`)}`);
  await Promise.all([loadMapData(), loadProfile(), loadTicker()]);
}

async function searchPlaces(event) {
  event.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;
  showStatus(t('searching'));

  try {
    const [localPayload, geocoded] = await Promise.all([
      api(`/api/search?q=${encodeURIComponent(query)}`),
      geocodePlaces(query).catch(() => [])
    ]);

    const merged = [...(localPayload.results || []), ...geocoded];
    const seen = new Set();
    state.searchResults = merged.filter((entry) => {
      const key = `${entry.lat.toFixed(5)}:${entry.lng.toFixed(5)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 8);

    renderSearchResults();

    if (state.searchResults.length === 1) {
      const result = state.searchResults[0];
      setUserPosition(result.lat, result.lng, false);
      map.flyTo([result.lat, result.lng], 16, { duration: 0.6 });
      await loadAreaSummary();
    }

    showStatus(state.searchResults.length ? state.searchResults[0].label : t('noSearchResults'));
  } catch {
    state.searchResults = [];
    renderSearchResults();
    showStatus(t('noSearchResults'));
  }
}

async function pollAlerts() {
  await Promise.all([loadMapData(), state.token ? loadProfile() : Promise.resolve()]);
  const newestAlert = state.mapData?.alerts?.[state.mapData.alerts.length - 1];
  if (newestAlert && newestAlert.id !== latestAlertId) {
    const shouldSound =
      latestAlertId &&
      state.user?.role === 'company' &&
      newestAlert.reporter?.role === 'company' &&
      newestAlert.reporter?.id !== state.user.id;
    latestAlertId = newestAlert.id;
    alertStrip.textContent = `${t('alertPoll')}: ${t(`alertTypes.${newestAlert.alertType}`) || t('alertTypes.general')} · ${newestAlert.reporter.name}`;
    alertStrip.classList.remove('hidden');
    if (shouldSound) {
      playCompanyAlertSound();
    }
  } else if (!newestAlert) {
    alertStrip.classList.add('hidden');
  }
  updateCurrentAlertsButton();
}

function startPolling() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(() => {
    pollAlerts().catch(() => {});
  }, state.token ? 8000 : 15000);
}

function toggleLanguage() {
  state.language = state.language === 'de' ? 'en' : 'de';
  rememberComfortValue('sicherodernicht-language', state.language);
  updateTranslations();
  renderMap();
}

function setView(view) {
  if (state.legendFilter) {
    stopLegendFilter(false);
  }
  state.currentView = view;
  updateTranslations();
  loadMapData().catch(() => {});
}

function toggleEmergency() {
  if (!(state.user && state.user.role === 'company')) {
    showStatus(t('companyOnlyEmergency'));
    return;
  }

  const alertGrid = companyPanel.querySelector('.company-alert-grid');
  if (!alertGrid) return;

  registeredPanel.classList.remove('hidden');
  alertGrid.scrollIntoView({ behavior: 'smooth', block: 'center' });
  alertGrid.classList.add('focus-pulse');
  showStatus(t('companyAlertSelectHint'));

  window.setTimeout(() => {
    alertGrid.classList.remove('focus-pulse');
  }, 1800);
}

function toggleFun() {
  state.funMode = !state.funMode;
  if (!state.funMode) {
    state.pendingFunPos = null;
  }
  funButtons.classList.toggle('hidden', !state.funMode);
  updateFunToggleState();
  renderMap();
}

function locateMe() {
  if (!navigator.geolocation) {
    showStatus(t('locateError'));
    return;
  }
  if (!window.isSecureContext && location.hostname !== 'localhost') {
    showStatus(t('secureContext'));
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      setUserPosition(position.coords.latitude, position.coords.longitude);
      centerOnUser(position.coords.latitude, position.coords.longitude);
      await loadAreaSummary();
    },
    () => {
      showStatus(t('locateError'));
    },
    { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
  );

  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }

  watchId = navigator.geolocation.watchPosition(
    (position) => setUserPosition(position.coords.latitude, position.coords.longitude, false),
    () => {},
    { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
  );
}

function autoLocateOnLoad() {
  if (!navigator.geolocation) return;
  if (!window.isSecureContext && location.hostname !== 'localhost') return;

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      setUserPosition(position.coords.latitude, position.coords.longitude, false);
      await loadAreaSummary();
    },
    () => {},
    { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
  );
}

map.on('click', async (event) => {
  state.followUser = false;
  setUserPosition(event.latlng.lat, event.latlng.lng);
  await loadAreaSummary();
});

map.doubleClickZoom.disable();

map.on('dblclick', (event) => {
  if (state.funMode) {
    state.pendingFunPos = {
      lat: event.latlng.lat,
      lng: event.latlng.lng
    };
    showStatus(t('funSetHint'));
    renderMap();
    return;
  }

  map.setZoomAround(event.latlng, map.getZoom() + 1);
});

map.on('zoom', () => {
  updateCircleOpacity();
});

map.on('movestart', () => {
  state.followUser = false;
});

map.on('zoomend', () => {
  renderMap();
});

window.addEventListener('resize', () => {
  map.invalidateSize();
});

window.addEventListener('pagehide', logoutOnAppClose);

languageToggle.addEventListener('click', toggleLanguage);
designToggleBtn.addEventListener('click', toggleDesignMode);
cookieSettingsBtn.addEventListener('click', () => showConsentBanner(true));
necessaryConsentBtn.addEventListener('click', () => saveConsent(false));
saveConsentBtn.addEventListener('click', () => saveConsent(comfortConsentInput.checked));
acceptComfortBtn.addEventListener('click', () => saveConsent(true));
locateBtn.addEventListener('click', locateMe);
currentAlertsBtn.addEventListener('click', focusNextCurrentAlert);
mainDangerBtn.addEventListener('click', () => {
  if (!state.user) {
    showStatus(t('dangerRegistrationHint'));
    return;
  }
  submitAlert('general');
});
funToggle.addEventListener('click', toggleFun);
searchForm.addEventListener('submit', searchPlaces);
logoutButton.addEventListener('click', logout);
loginButton.addEventListener('click', () => {
  if (state.user) {
    const panelTop = authPanel.getBoundingClientRect().top + window.scrollY - 18;
    window.scrollTo({ top: panelTop, behavior: 'smooth' });
    return;
  }

  loginPopover.classList.toggle('hidden');
  if (!loginPopover.classList.contains('hidden')) {
    renderLoginPopover();
  }
});

async function bootstrap() {
  applyDesignMode();
  showConsentBanner();
  const bootstrapData = await api('/api/bootstrap');
  state.mapData = { companies: bootstrapData.companies, emergencyPlaces: bootstrapData.emergencyPlaces, cells: [], alerts: [], funReports: [] };
  updateTranslations();
  await Promise.all([loadMapData(), loadProfile()]);
  await loadTicker();
  renderSearchResults();
  startPolling();
  renderAreaSummary();
  autoLocateOnLoad();
}

bootstrap().catch((error) => {
  console.error(error);
  showStatus('App konnte nicht geladen werden.');
});
