# sicherodernicht

Mobile-first Web-App fuer ortsbezogene Sicherheits- und Erlebnisbewertungen.

Lokaler Projektordner:

`/Users/peterkrawitz/Documents/Web-App`

## Lokal starten

```bash
npm start
```

Danach im Browser oeffnen:

```text
http://localhost:3000
```

Alternativ auf dem Mac:

`Start sicherodernicht.command` doppelklicken.

## Wichtige Dateien

- `server.js`: lokaler Node-Server und API
- `public/index.html`: Hauptseite
- `public/app.js`: Karten-, Login- und Button-Logik
- `public/styles.css`: Design
- `public/admin.html`: lokale Verwaltung fuer Firmen und registrierte Nutzer
- `public/rechtliches.html`: Impressum und Datenschutz-Vorlage
- `data/store.json`: lokale Prototyp-Datenbank

## Deployment-Vorbereitung

Die App ist fuer ein Node-Hosting vorbereitet.

Render:

- Build Command: leer lassen oder `npm install`
- Start Command: `npm start`
- Node-Version: 20 oder hoeher

Domain:

`sicherodernicht.de` wird spaeter bei Render als Custom Domain verbunden.

## Wichtiger Hinweis

Der aktuelle Stand ist ein Prototyp. Vor einem echten Livebetrieb muessen insbesondere Datenbank, Login-Sicherheit, Admin-Schutz, Datenschutz und Backups produktionsreif umgesetzt werden.

Keine `.env.local` und keine echten Zugangsdaten in ZIP-Dateien weitergeben.
Beim Erstellen einer ZIP außerdem `.git`, `node_modules`, `data/store.json`, `data/reports.json`, `.DS_Store`, `__MACOSX` und alte ZIP-Dateien weglassen.
