// PassKit-Erweiterung (separat gehalten, damit sie später leicht entfernbar ist)
export const passkitPassTypes = [
  { id: 'boardingPass', name: '✈️ Boarding Pass' },
  { id: 'eventTicket', name: '🎫 Event Ticket' },
  { id: 'storeCard', name: '🛍️ Store Card (Loyalty)' },
  { id: 'coupon', name: '🎟️ Coupon' },
  { id: 'generic', name: '💳 Generic Pass' }
];

export const passkitBarcodeFormats = [
  { id: 'PKBarcodeFormatQR', name: 'QR Code' },
  { id: 'PKBarcodeFormatPDF417', name: 'PDF417' },
  { id: 'PKBarcodeFormatCode128', name: 'Code128' }
];

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

function sanitizeString(value) {
  return String(value || '').trim();
}

function sanitizeNumber(value) {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
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
    location: {
      latitude: sanitizeNumber(location.latitude),
      longitude: sanitizeNumber(location.longitude)
    },
    barcode: {
      format: sanitizeString(config.barcode?.format) || fallback.barcode.format,
      messageEncoding: sanitizeString(config.barcode?.messageEncoding) || fallback.barcode.messageEncoding
    }
  };
}
