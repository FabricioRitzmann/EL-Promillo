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
  previewMode: 'horizontal',
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

export const walletGalleryTemplates = [
  { id: 'blank', templateType: 'blank', label: 'Leeres Template', description: 'Ohne Vorgaben starten.', palette: ['#e5e7eb', '#f9fafb'], accent: '#6b7280' },
  { id: 'loyalty-midnight', templateType: 'loyalty', label: 'Midnight Loyalty', description: 'Dunkel mit starken Akzenten.', palette: ['#2b2f77', '#6b72f7'], accent: '#fef3c7' },
  { id: 'loyalty-sunrise', templateType: 'loyalty', label: 'Sunrise Points', description: 'Warme Treuekartenoptik.', palette: ['#7c2d12', '#fb923c'], accent: '#fffbeb' },
  { id: 'membership-platinum', templateType: 'membership', label: 'Platinum Club', description: 'Premium-Mitgliedschaft.', palette: ['#374151', '#9ca3af'], accent: '#f3f4f6' },
  { id: 'membership-ocean', templateType: 'membership', label: 'Ocean Member', description: 'Klar und modern.', palette: ['#0f172a', '#0284c7'], accent: '#e0f2fe' },
  { id: 'coupon-vibrant', templateType: 'coupon', label: 'Vibrant Deal', description: 'Hoher Kontrast für Aktionen.', palette: ['#f59e0b', '#ef4444'], accent: '#111827' },
  { id: 'coupon-clean', templateType: 'coupon', label: 'Clean Offer', description: 'Reduziert und klar.', palette: ['#e5e7eb', '#ffffff'], accent: '#111827' },
  { id: 'event-neon', templateType: 'event_ticket', label: 'Neon Festival', description: 'Event-Look mit Bühnengefühl.', palette: ['#1e1b4b', '#7c3aed'], accent: '#fde047' },
  { id: 'event-classic', templateType: 'event_ticket', label: 'Classic Ticket', description: 'Klassische Ticket-Anmutung.', palette: ['#0f172a', '#1d4ed8'], accent: '#dbeafe' },
  { id: 'boarding-sky', templateType: 'boarding_pass', label: 'Sky Boarding', description: 'Flugkarte mit klaren Segmenten.', palette: ['#0c4a6e', '#38bdf8'], accent: '#f0f9ff' },
  { id: 'boarding-terminal', templateType: 'boarding_pass', label: 'Terminal Strip', description: 'Technischer Boarding-Stil.', palette: ['#1f2937', '#4b5563'], accent: '#facc15' },
  { id: 'gift-aurora', templateType: 'gift_card', label: 'Aurora Gift', description: 'Guthabenkarte mit Verlauf.', palette: ['#1d4ed8', '#0ea5e9'], accent: '#e0f2fe' },
  { id: 'gift-rose', templateType: 'gift_card', label: 'Rose Gift', description: 'Emotionale Geschenkoptik.', palette: ['#9d174d', '#f472b6'], accent: '#ffe4e6' },
  { id: 'stamp-cafe', templateType: 'stamp_card', label: 'Cafe Stamp', description: 'Kompakte Stempel-Ansicht.', palette: ['#78350f', '#d97706'], accent: '#fef3c7' },
  { id: 'stamp-fresh', templateType: 'stamp_card', label: 'Fresh Stamp', description: 'Leicht und freundlich.', palette: ['#14532d', '#22c55e'], accent: '#dcfce7' },
  { id: 'policy-safe', templateType: 'policy_pass', label: 'Safe Policy', description: 'Sachlicher Versicherungsstil.', palette: ['#0f766e', '#2dd4bf'], accent: '#ccfbf1' },
  { id: 'policy-trust', templateType: 'policy_pass', label: 'Trust Policy', description: 'Seriös und kontraststark.', palette: ['#1e3a8a', '#60a5fa'], accent: '#dbeafe' }
];

export function getTemplateGalleryByType() {
  return WALLET_TEMPLATE_TYPES.map((type) => ({
    ...type,
    variants: walletGalleryTemplates.filter((entry) => entry.templateType === type.id)
  }));
}

export function getTemplateVariantById(variantId) {
  return walletGalleryTemplates.find((entry) => entry.id === variantId) || walletGalleryTemplates[0];
}

export function getDefaultTemplatePreset(variantId) {
  const variant = getTemplateVariantById(variantId);
  const defaultPresets = {
    blank: {
      templateType: 'blank',
      title: 'Leere Karte',
      subtitle: 'Blank Template',
      backgroundColor: '#1f2937',
      foregroundColor: '#ffffff',
      memberTier: '',
      points: 0
    },
    loyalty: { subtitle: 'Loyalty Card', memberTier: 'Gold', points: 88 },
    membership: { subtitle: 'Membership Card', memberTier: 'Premium', points: 0 },
    coupon: { subtitle: 'Coupon', memberTier: 'Deal', points: 50 },
    event_ticket: { subtitle: 'Event Ticket', memberTier: 'Admit One', points: 0 },
    boarding_pass: { subtitle: 'Boarding Pass', memberTier: 'Gate A12', points: 0 },
    gift_card: { subtitle: 'Gift Card', memberTier: 'Gift Balance', points: 0 },
    stamp_card: { subtitle: 'Stamp Card', memberTier: 'Progress', points: 0 },
    policy_pass: { subtitle: 'Policy Pass', memberTier: 'Aktiv', points: 0 }
  };

  const base = defaultPresets[variant.templateType] || defaultPresets.loyalty;
  return {
    ...base,
    templateType: variant.templateType,
    variantId: variant.id,
    title: base.title || variant.label,
    backgroundColor: variant.palette[0],
    foregroundColor: variant.accent,
    passBackgroundTemplate: 'custom',
    previewMode: defaultWalletCard.previewMode
  };
}

export function normalizeWalletTemplateType(value) {
  const allowed = [...WALLET_TEMPLATE_TYPES.map((entry) => entry.id), 'blank'];
  return allowed.includes(value) ? value : defaultWalletCard.templateType;
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
