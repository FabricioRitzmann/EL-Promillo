# Wallet Mapping (Apple, Google, Samsung)

Diese App speichert eine zentrale `walletConfig`-Struktur (Version `2`) und hält bestehende `passkit_config`-Daten als Fallback kompatibel.

## Struktur

```json
{
  "walletConfigVersion": 2,
  "baseData": { "locale": "de-CH", "timezone": "Europe/Zurich", "status": "active" },
  "platforms": {
    "apple": {},
    "google": { "enabled": true, "passType": "generic" },
    "samsung": { "enabled": false, "cardType": "generic" }
  },
  "barcode": { "selection": "QR", "static": true },
  "previewConfig": {
    "appleVertical": {}, "appleWatch": {}, "google": {}, "samsung": {}, "webHorizontal": {}, "webVertical": {}
  }
}
```

## Apple

- Apple-Konfiguration liegt unter `platforms.apple`.
- Unterstützte Barcode-Formate im Editor:
  - `PKBarcodeFormatQR`
  - `PKBarcodeFormatAztec`
  - `PKBarcodeFormatPDF417`
  - `PKBarcodeFormatCode128` (mit Hinweis für Apple Watch)
- Ungültige Barcode-Formate werden auf `PKBarcodeFormatQR` normalisiert.

## Rückwärtskompatibilität

Beim Laden gilt folgende Reihenfolge:
1. `entry.wallet_config.platforms.apple`
2. `entry.passkit_config`
3. Default-Konfiguration

Beim Speichern wird `wallet_config` zusätzlich zu `passkit_config` geschrieben, damit ältere Datenflüsse weiter funktionieren.
