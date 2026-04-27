export function mapToGoogleWallet(cardData) {
  const { templateType, fields, barcodeConfig, designConfig } = cardData;
  return {
    objectType: mapGoogleObjectType(templateType),
    id: `issuerId.${fields.customerNumber || crypto.randomUUID()}`,
    classId: `issuerId.${templateType}`,
    state: 'ACTIVE',
    heroImage: null,
    hexBackgroundColor: designConfig.backgroundColor,
    cardTitle: { defaultValue: { language: 'de-CH', value: fields.title || 'Wallet Karte' } },
    header: { defaultValue: { language: 'de-CH', value: fields.companyName || 'Deine Firma' } },
    subheader: { defaultValue: { language: 'de-CH', value: getGoogleSubheader(cardData) } },
    barcode: { type: mapGoogleBarcodeType(barcodeConfig.type), value: barcodeConfig.value || fields.customerNumber },
    textModulesData: getGoogleTextModules(cardData)
  };
}

function mapGoogleObjectType(templateType) {
  switch (templateType) {
    case 'loyalty': return 'loyaltyObject';
    case 'gift_card': return 'giftCardObject';
    case 'event_ticket': return 'eventTicketObject';
    case 'boarding_pass': return 'flightObject';
    case 'coupon': return 'offerObject';
    default: return 'genericObject';
  }
}

function getGoogleSubheader(cardData) {
  const { templateType, fields } = cardData;
  if (templateType === 'loyalty') return `${fields.points || 0} Punkte`;
  if (templateType === 'gift_card') return `${fields.currency || 'CHF'} ${Number(fields.balance || 0).toFixed(2)}`;
  if (templateType === 'event_ticket') return fields.eventDate || '';
  if (templateType === 'boarding_pass') return `${fields.departure || ''} → ${fields.destination || ''}`;
  return fields.fullName || fields.customerNumber || '';
}

function getGoogleTextModules(cardData) {
  const { fields, stampConfig } = cardData;
  return [
    { id: 'name', header: 'Name', body: fields.fullName },
    { id: 'customerNumber', header: 'Nummer', body: fields.customerNumber },
    { id: 'tier', header: 'Status', body: fields.tier },
    { id: 'points', header: 'Punkte', body: String(fields.points || '') },
    {
      id: 'balance',
      header: 'Guthaben',
      body: fields.balance !== '' ? `${fields.currency || 'CHF'} ${Number(fields.balance || 0).toFixed(2)}` : ''
    },
    {
      id: 'stamps',
      header: 'Stempel',
      body: stampConfig ? `${stampConfig.collectedStamps}/${stampConfig.totalStamps}` : ''
    },
    { id: 'validUntil', header: 'Gültig bis', body: fields.validUntil }
  ].filter((item) => item.body);
}

function mapGoogleBarcodeType(type) {
  switch (type) {
    case 'PDF417': return 'PDF_417';
    case 'AZTEC': return 'AZTEC';
    case 'CODE128':
    case 'BARCODE':
    case 'Code128':
      return 'CODE_128';
    case 'QR':
    default: return 'QR_CODE';
  }
}
