# Wallet Pass Studio

Eine einfache Web-App (HTML/CSS/JS + Supabase), um Wallet-Karten im Stil der PassKit-Templates zu erstellen.

## Features
- Templates: `generic`, `boardingPass`, `eventTicket`, `coupon`, `storeCard`
- Apple-inspiriertes UI mit Live-Vorschau
- Speichern/Laden der Karten via Supabase
- JSON-Export im PassKit-ähnlichen Format
- SQL-Schema inkl. Tabellen, Trigger, Indizes und RLS-Policies

## Start
1. Führe `supabase/schema.sql` im Supabase SQL Editor aus.
2. Prüfe `config/supabase.json`.
3. Starte einen lokalen Static-Server im Projektordner, z. B.:
   - `python3 -m http.server 8080`
4. Öffne dann `http://localhost:8080`.

## Supabase-Verbindung in der Datenbank hinterlegen
Wenn du die Verbindung zusätzlich direkt in Supabase speichern willst (z. B. für spätere Verwaltung), gehe so vor:

1. Führe zuerst `supabase/schema.sql` aus (enthält jetzt auch die Tabelle `public.supabase_connections`).
2. Führe danach `supabase/seed_connection.sql` aus.
3. Passe bei Bedarf `name`, `supabase_url` und `supabase_anon_key` in `supabase/seed_connection.sql` an.

Damit hast du eine aktive Verbindung in Supabase gespeichert, auf die du später aufbauen kannst.

## Wichtiger Hinweis zu echten `.pkpass` Dateien
Diese App erzeugt absichtlich **JSON-Export** und keine signierten `.pkpass` Dateien.
Für echte Apple Wallet `.pkpass` Dateien brauchst du zusätzlich einen Server-Schritt zum Signieren (Apple Zertifikate + Manifest + Signatur).
