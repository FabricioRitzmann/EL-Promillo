# Pass Studio (PassKit-inspiriert)

Eine moderne Web-App mit:

- Login/Registrierung (E-Mail + Passwort)
- Passwort-Reset via OTP/Reset-E-Mail
- Karten-Editor im PassKit-Stil
- Templates + eigene Design-Uploads
- QR-Code Live-Vorschau
- Speicherung in Supabase
- Branchenfelder für Betriebe (Restaurant/Bar/Club/Café/Bäckerei/...)
- Anonymisierte Scan-Statistik pro Betrieb (ohne private Kundendaten)

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

## Brauche ich SQL für die Registrierung?

Für **Login/Registrierung via Supabase Auth** brauchst du **kein zusätzliches SQL**.
Das SQL in `supabase/schema.sql` ist nur für:

- Tabelle `wallet_passes`
- RLS-Policies für gespeicherte Pässe
- Storage-Bucket `pass-backgrounds`

Wenn Registrierung nicht geht, prüfe primär:

1. In `js/config.js` sind echte Supabase-Werte eingetragen.
2. In Supabase unter **Authentication → Providers → Email** ist der E-Mail Provider aktiv.
3. Bei Tests ist **Confirm email** ggf. deaktiviert (sonst erst nach Mail-Bestätigung einloggen).
4. Passwort ist lang genug (Supabase verlangt standardmäßig mind. 6 Zeichen).

## Fehler "Failed to fetch" bei Registrierung

Wenn bei Registrierung/Login "Failed to fetch" erscheint, liegt es meist an einer dieser Ursachen:

- `js/config.js` enthält noch Platzhalter (`YOUR-PROJECT`, `YOUR_PUBLIC_ANON_KEY`)
- App wurde als Datei (`file://...`) statt über einen lokalen Webserver geöffnet
- Netzwerk/CORS blockiert Anfragen zu Supabase

Die App zeigt dafür jetzt eine klarere Fehlermeldung an.

## Hinweis zu echten Wallet-Dateien

Diese Version erstellt und verwaltet die Pass-Daten und QR-Codes im Frontend.
Für echte `.pkpass`-Dateien brauchst du zusätzlich einen Server-Endpunkt, der Apple-Zertifikate nutzt und PassKit-Dateien signiert.

## PassKit-Erweiterung (separat gespeichert)

Die App enthält jetzt einen eigenen Bereich **„PassKit-Erweiterung (separat)”** im Editor.
Alle PassKit-spezifischen Daten werden bewusst getrennt gespeichert in:

- `wallet_passes.passkit_enabled` (Boolean)
- `wallet_passes.passkit_config` (JSONB)

Dadurch kann man die Erweiterung später schnell filtern, migrieren oder wieder entfernen, ohne die restliche Kartenlogik umzubauen.

## Wallet-Tracking für Endnutzer

Das SQL enthält jetzt zusätzlich ein Datenmodell für den echten Betriebseinsatz:

- `wallet_passes`: enthält Karten-Vorlagen inkl. `business_name`, `business_category` und `template_storage_path`.
- `wallet_pass_instances`: eine individuelle Wallet-Instanz pro Endnutzer und Karte (inkl. eindeutigem `wallet_reference_path`).
- `pass_scan_events`: jeder Scan-/Punkte-/Stempel-Event wird revisionssicher gespeichert.
- `business_scan_stats_anonymized` (View): liefert lesbare Statistiken pro Betrieb/Karte mit anonymisierten Kundenzahlen (`customer_reference_hash`).

So können Betriebe nachvollziehen, wie oft Karten genutzt werden, ohne personenbezogene Endkundendaten im Klartext auszulesen.
