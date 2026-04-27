export const WALLET_TEMPLATE_TYPES = [
  { id: 'loyalty', label: 'Loyalty Card', description: 'Treuekarte mit Punkten und Tier-Status.' },
  { id: 'membership', label: 'Membership Card', description: 'Mitgliedskarte mit Laufzeit und Status.' },
  { id: 'coupon', label: 'Coupon', description: 'Gutschein mit Ablaufdatum und Bedingungen.' },
  { id: 'event_ticket', label: 'Event Ticket', description: 'Ticket mit Eventdaten und Sitzplatz.' },
  { id: 'boarding_pass', label: 'Boarding Pass', description: 'Boarding Pass mit Route und Gate.' },
  { id: 'gift_card', label: 'Gift Card', description: 'Geschenkkarte mit Guthaben und Währung.' },
  { id: 'stamp_card', label: 'Stamp Card', description: 'Stempelkarte mit Fortschrittsanzeige.' },
  { id: 'policy_pass', label: 'Policy Pass', description: 'Versicherungs-/Policy-Pass mit Vertragsdaten.' }
];

export const defaultWalletCard = {
  templateType: 'loyalty',
  designConfig: {
    primaryColor: '#4654B8',
    secondaryColor: '#FFFFFF',
    backgroundColor: '#4654B8',
    textColor: '#FFFFFF',
    labelColor: 'rgba(255,255,255,0.75)',
    borderRadius: 16,
    shadow: true
  },
  assets: {
    logoUrl: '',
    backgroundUrl: '',
    stripUrl: '',
    thumbnailUrl: '',
    profileImageUrl: '',
    productImageUrl: '',
    eventImageUrl: '',
    stampIconUrl: ''
  },
  fields: {
    companyName: 'Egli+Vitali AG',
    title: 'Kundenkarte',
    fullName: 'Max Muster',
    customerNumber: 'EV-000123',
    memberSince: '',
    validUntil: '31.12.2026',
    tier: 'Gold',
    points: 88,
    balance: 88,
    currency: 'CHF',
    email: '',
    eventName: '',
    eventDate: '',
    eventTime: '',
    eventLocation: '',
    section: '',
    row: '',
    seat: '',
    departure: '',
    destination: '',
    gate: '',
    flightNumber: '',
    boardingTime: '',
    policyName: '',
    coverage: '',
    deductible: '',
    coInsurance: ''
  },
  stampConfig: {
    totalStamps: 10,
    collectedStamps: 3,
    rewardText: 'Belohnung nach 10 Stempeln'
  },
  barcodeConfig: {
    type: 'QR',
    value: 'EV-000123',
    showText: true
  },
  backsideConfig: {
    contact: '',
    website: '',
    supportEmail: '',
    terms: '',
    privacyText: ''
  },
  advancedConfig: {
    relevantDate: '',
    locations: [],
    pushUpdatesEnabled: false,
    status: 'active'
  },
  layoutConfig: {
    logo: { x: 16, y: 14 },
    title: { x: 16, y: 54 },
    mainValue: { x: 16, y: 92 },
    secondaryValue: { x: 16, y: 140 },
    points: { x: 280, y: 18 },
    balance: { x: 220, y: 145 },
    barcode: { x: 245, y: 145 },
    stampGrid: { x: 20, y: 90 },
    image: { x: 165, y: 60 }
  }
};

export function normalizeWalletTemplateType(value) {
  const match = WALLET_TEMPLATE_TYPES.find((entry) => entry.id === value);
  return match ? match.id : defaultWalletCard.templateType;
}

export function templateSupportsField(templateType, fieldKey) {
  const map = {
    loyalty: ['tier', 'points', 'customerNumber', 'validUntil'],
    membership: ['memberSince', 'validUntil', 'email', 'tier'],
    coupon: ['validUntil'],
    event_ticket: ['eventName', 'eventDate', 'eventTime', 'eventLocation', 'section', 'row', 'seat'],
    boarding_pass: ['departure', 'destination', 'gate', 'flightNumber', 'boardingTime', 'seat'],
    gift_card: ['balance', 'currency', 'customerNumber'],
    stamp_card: ['customerNumber'],
    policy_pass: ['policyName', 'coverage', 'deductible', 'coInsurance', 'customerNumber']
  };
  return (map[templateType] || []).includes(fieldKey);
}
