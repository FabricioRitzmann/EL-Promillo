export function mapToSamsungWallet(cardData) {
  const { templateType, fields, designConfig, barcodeConfig, stampConfig } = cardData;
  return {
    cardType: mapSamsungCardType(templateType),
    cardId: fields.customerNumber || crypto.randomUUID(),
    status: 'ACTIVE',
    title: fields.title || 'Wallet Karte',
    organizationName: fields.companyName || 'Deine Firma',
    design: {
      backgroundColor: designConfig.backgroundColor,
      textColor: designConfig.textColor,
      labelColor: designConfig.labelColor
    },
    barcode: {
      type: mapSamsungBarcodeType(barcodeConfig.type),
      value: barcodeConfig.value || fields.customerNumber
    },
    data: {
      fullName: fields.fullName,
      customerNumber: fields.customerNumber,
      tier: fields.tier,
      points: fields.points,
      balance: fields.balance,
      currency: fields.currency,
      validUntil: fields.validUntil,
      eventName: fields.eventName,
      eventDate: fields.eventDate,
      eventLocation: fields.eventLocation,
      departure: fields.departure,
      destination: fields.destination,
      gate: fields.gate,
      seat: fields.seat,
      policyName: fields.policyName,
      coverage: fields.coverage,
      deductible: fields.deductible,
      coInsurance: fields.coInsurance,
      stamps: stampConfig ? `${stampConfig.collectedStamps}/${stampConfig.totalStamps}` : undefined
    }
  };
}

function mapSamsungCardType(templateType) {
  switch (templateType) {
    case 'loyalty': return 'membership';
    case 'coupon': return 'coupon';
    case 'event_ticket': return 'ticket';
    case 'boarding_pass': return 'boardingPass';
    case 'gift_card': return 'giftCard';
    case 'stamp_card': return 'membership';
    case 'policy_pass': return 'generic';
    default: return 'generic';
  }
}

function mapSamsungBarcodeType(type) {
  switch (type) {
    case 'PDF417': return 'PDF417';
    case 'CODE128':
    case 'BARCODE':
    case 'Code128':
      return 'CODE128';
    case 'AZTEC': return 'AZTEC';
    case 'QR':
    default: return 'QR';
  }
}
