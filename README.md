# Pass Studio (PassKit-inspiriert)

Eine moderne Web-App mit:

- Login/Registrierung (E-Mail + Passwort)
- Passwort-Reset via OTP/Reset-E-Mail
- Karten-Editor im PassKit-Stil
- Templates + eigene Design-Uploads
- QR-Code Live-Vorschau
- Speicherung in Supabase

## Projektstruktur

```text
projekt/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── api.js
│   ├── ui.js
│   └── config.js
├── config/
│   └── supabase.json
├── supabase/
│   └── schema.sql
└── assets/
    ├── images/
    └── icons/
```

## Schnellstart

1. `config/supabase.json` und `js/config.js` mit deinen Supabase Werten füllen.
2. SQL aus `supabase/schema.sql` im Supabase SQL Editor ausführen.
3. Für Test-Registrierungen mit beliebigen E-Mails in Supabase unter **Authentication → Providers → Email** die Option
   **Confirm email** deaktivieren.
4. Projekt mit einem lokalen Static Server starten, z. B.:
   ```bash
   python -m http.server 8080
   ```
5. Browser öffnen: `http://localhost:8080`

## Fehler "Failed to fetch" bei Registrierung

Wenn bei Registrierung/Login "Failed to fetch" erscheint, liegt es meist an einer dieser Ursachen:

- `js/config.js` enthält noch Platzhalter (`YOUR-PROJECT`, `YOUR_PUBLIC_ANON_KEY`)
- App wurde als Datei (`file://...`) statt über einen lokalen Webserver geöffnet
- Netzwerk/CORS blockiert Anfragen zu Supabase

Die App zeigt dafür jetzt eine klarere Fehlermeldung an.

## Hinweis zu echten Wallet-Dateien

Diese Version erstellt und verwaltet die Pass-Daten und QR-Codes im Frontend.
Für echte `.pkpass`-Dateien brauchst du zusätzlich einen Server-Endpunkt, der Apple-Zertifikate nutzt und PassKit-Dateien signiert.
