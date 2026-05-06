// PassKit-Optionen für die integrierten Formularfelder im Basisdatenbereich.
export const passkitPassTypes = [
  { id: 'boardingPass', name: '✈️ Boarding Pass' },
  { id: 'eventTicket', name: '🎫 Event Ticket' },
  { id: 'storeCard', name: '🛍️ Store Card (Loyalty)' },
  { id: 'coupon', name: '🎟️ Coupon' },
  { id: 'generic', name: '💳 Generic Pass' }
];

export const passkitBarcodeFormats = [
  { id: 'PKBarcodeFormatQR', name: 'QR Code' },
  { id: 'PKBarcodeFormatAztec', name: 'Aztec' },
  { id: 'PKBarcodeFormatPDF417', name: 'PDF417' },
  { id: 'PKBarcodeFormatCode128', name: 'Code128 (nicht auf Apple Watch)' }
];

const SUPPORTED_APPLE_BARCODES = new Set(passkitBarcodeFormats.map((item) => item.id));

export function getDefaultPasskitConfig() {
  return {
    enabled: false,
    passType: 'generic',
    passTypeIdentifier: '',
    teamIdentifier: '',
    organizationName: '',
    serialNumber: '',
    description: '',
    foregroundColor: 'rgb(255,255,255)',
    backgroundColor: 'rgb(0,0,0)',
    labelColor: 'rgb(200,200,200)',
    relevantDate: '',
    locations: [],
    barcode: {
      format: 'PKBarcodeFormatQR',
      messageEncoding: 'iso-8859-1'
    }
  };
}

export function getDefaultWalletConfig() {
  return {
    walletConfigVersion: 2,
    baseData: {
      locale: 'de-CH',
      timezone: 'Europe/Zurich',
      status: 'active'
    },
    platforms: {
      apple: getDefaultPasskitConfig(),
      google: { enabled: true, passType: 'generic' },
      samsung: { enabled: false, cardType: 'generic' }
    },
    barcode: {
      selection: 'QR',
      static: true
    },
    previewConfig: {
      appleVertical: {},
      appleWatch: {},
      google: {},
      samsung: {},
      webHorizontal: {},
      webVertical: {}
    }
  };
}

function sanitizeString(value) { return String(value || '').trim(); }
function sanitizeNumber(value) { if (value === '' || value === null || value === undefined) return null; const p = Number(value); return Number.isFinite(p) ? p : null; }

function normalizeAppleBarcode(format) {
  const candidate = sanitizeString(format);
  if (SUPPORTED_APPLE_BARCODES.has(candidate)) return candidate;
  return 'PKBarcodeFormatQR';
}

export function normalizePasskitConfig(config = {}) {
  const fallback = getDefaultPasskitConfig();
  const location = config.location || config.locations?.[0] || {};
  return {
    ...fallback,
    ...config,
    enabled: Boolean(config.enabled),
    passType: sanitizeString(config.passType) || fallback.passType,
    passTypeIdentifier: sanitizeString(config.passTypeIdentifier),
    teamIdentifier: sanitizeString(config.teamIdentifier),
    organizationName: sanitizeString(config.organizationName),
    serialNumber: sanitizeString(config.serialNumber),
    description: sanitizeString(config.description),
    foregroundColor: sanitizeString(config.foregroundColor) || fallback.foregroundColor,
    backgroundColor: sanitizeString(config.backgroundColor) || fallback.backgroundColor,
    labelColor: sanitizeString(config.labelColor) || fallback.labelColor,
    relevantDate: sanitizeString(config.relevantDate),
    location: { latitude: sanitizeNumber(location.latitude), longitude: sanitizeNumber(location.longitude) },
    barcode: {
      format: normalizeAppleBarcode(config.barcode?.format),
      messageEncoding: sanitizeString(config.barcode?.messageEncoding) || fallback.barcode.messageEncoding
    }
  };
}

export function getEditorPasskitConfig(config = {}) {
  const normalized = normalizePasskitConfig(config);
  if (!normalized.enabled) return { enabled: false };
  const location = normalized.location.latitude !== null && normalized.location.longitude !== null
    ? { latitude: normalized.location.latitude, longitude: normalized.location.longitude }
    : undefined;
  return {
    enabled: true,
    passType: normalized.passType,
    passTypeIdentifier: normalized.passTypeIdentifier,
    teamIdentifier: normalized.teamIdentifier,
    organizationName: normalized.organizationName,
    serialNumber: normalized.serialNumber,
    description: normalized.description,
    foregroundColor: normalized.foregroundColor,
    backgroundColor: normalized.backgroundColor,
    labelColor: normalized.labelColor,
    relevantDate: normalized.relevantDate,
    location,
    barcode: { format: normalized.barcode.format, messageEncoding: normalized.barcode.messageEncoding }
  };
}
