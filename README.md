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

## Wichtiger Hinweis zu echten `.pkpass` Dateien
Diese App erzeugt absichtlich **JSON-Export** und keine signierten `.pkpass` Dateien.
Für echte Apple Wallet `.pkpass` Dateien brauchst du zusätzlich einen Server-Schritt zum Signieren (Apple Zertifikate + Manifest + Signatur).
