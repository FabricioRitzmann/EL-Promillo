export function mapToApplePass(cardData) {
  const { templateType, fields, designConfig, barcodeConfig } = cardData;

  const passStyle = getApplePassStyle(templateType);

  return {
    formatVersion: 1,
    passTypeIdentifier: 'pass.ch.deinefirma.wallet',
    serialNumber: fields.customerNumber || crypto.randomUUID(),
    teamIdentifier: 'YOUR_TEAM_ID',
    organizationName: fields.companyName || 'Deine Firma',
    description: fields.title || 'Wallet Karte',
    foregroundColor: toRgb(designConfig.textColor),
    backgroundColor: toRgb(designConfig.backgroundColor),
    labelColor: toRgb(designConfig.labelColor),
    logoText: fields.companyName,
    [passStyle]: {
      primaryFields: getApplePrimaryFields(cardData),
      secondaryFields: getAppleSecondaryFields(cardData),
      auxiliaryFields: getAppleAuxiliaryFields(cardData),
      backFields: getAppleBackFields(cardData)
    },
    barcodes: [
      {
        format: mapAppleBarcodeFormat(barcodeConfig.type),
        message: barcodeConfig.value || fields.customerNumber,
        messageEncoding: 'iso-8859-1'
      }
    ]
  };
}

function getApplePassStyle(templateType) {
  switch (templateType) {
    case 'boarding_pass': return 'boardingPass';
    case 'event_ticket': return 'eventTicket';
    case 'coupon': return 'coupon';
    case 'loyalty':
    case 'gift_card':
    case 'stamp_card':
    case 'membership':
      return 'storeCard';
    default:
      return 'generic';
  }
}

function getApplePrimaryFields(cardData) {
  const { templateType, fields } = cardData;
  if (templateType === 'boarding_pass') {
    return [{ key: 'route', label: 'Route', value: `${fields.departure || ''} → ${fields.destination || ''}` }];
  }
  if (templateType === 'event_ticket') {
    return [{ key: 'event', label: 'Event', value: fields.eventName || fields.title }];
  }
  if (templateType === 'gift_card') {
    return [{ key: 'balance', label: 'Guthaben', value: `${fields.currency || 'CHF'} ${Number(fields.balance || 0).toFixed(2)}` }];
  }
  return [{ key: 'name', label: fields.title || 'Name', value: fields.fullName || fields.companyName || fields.title }];
}

function getAppleSecondaryFields(cardData) {
  const { templateType, fields } = cardData;
  if (templateType === 'loyalty') {
    return [
      { key: 'points', label: 'Punkte', value: String(fields.points || 0) },
      { key: 'tier', label: 'Status', value: fields.tier || '' }
    ];
  }
  if (templateType === 'boarding_pass') {
    return [
      { key: 'gate', label: 'Gate', value: fields.gate || '' },
      { key: 'seat', label: 'Sitz', value: fields.seat || '' }
    ];
  }
  if (templateType === 'event_ticket') {
    return [
      { key: 'date', label: 'Datum', value: fields.eventDate || '' },
      { key: 'location', label: 'Ort', value: fields.eventLocation || '' }
    ];
  }
  return [
    { key: 'number', label: 'Nummer', value: fields.customerNumber || '' },
    { key: 'valid', label: 'Gültig bis', value: fields.validUntil || '' }
  ];
}

function getAppleAuxiliaryFields(cardData) {
  const { templateType, fields, stampConfig } = cardData;
  if (templateType === 'stamp_card') {
    return [{ key: 'stamps', label: 'Stempel', value: `${stampConfig.collectedStamps}/${stampConfig.totalStamps}` }];
  }
  if (templateType === 'policy_pass') {
    return [
      { key: 'coverage', label: 'Deckung', value: fields.coverage || '' },
      { key: 'deductible', label: 'Selbstbehalt', value: fields.deductible || '' }
    ];
  }
  return [];
}

function getAppleBackFields(cardData) {
  const { fields, backsideConfig = {} } = cardData;
  return [
    { key: 'company', label: 'Firma', value: fields.companyName || '' },
    { key: 'contact', label: 'Kontakt', value: backsideConfig.contact || '' },
    { key: 'website', label: 'Website', value: backsideConfig.website || '' },
    { key: 'terms', label: 'Bedingungen', value: backsideConfig.terms || '' }
  ].filter((field) => field.value);
}

function mapAppleBarcodeFormat(type) {
  switch (type) {
    case 'PDF417': return 'PKBarcodeFormatPDF417';
    case 'BARCODE':
    case 'CODE128':
    case 'Code128':
      return 'PKBarcodeFormatCode128';
    case 'AZTEC': return 'PKBarcodeFormatAztec';
    case 'QR':
    default:
      return 'PKBarcodeFormatQR';
  }
}

function toRgb(value) {
  if (!value || value.startsWith('rgb')) return value || 'rgb(0,0,0)';
  const hex = value.replace('#', '');
  const bigint = parseInt(hex, 16);
  if (Number.isNaN(bigint)) return 'rgb(0,0,0)';
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgb(${r},${g},${b})`;
}
