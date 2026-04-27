export const DEFAULT_WALLET_TEMPLATES = [
  {
    id: 'blank_template',
    name: 'Leeres Template',
    templateType: 'blank',
    previewMode: 'horizontal',
    designConfig: {
      primaryColor: '#ffffff',
      secondaryColor: '#f5f5f7',
      backgroundColor: '#ffffff',
      textColor: '#111111',
      labelColor: 'rgba(0,0,0,0.55)',
      borderRadius: 18,
      shadow: true
    },
    assets: {
      logoUrl: '',
      backgroundUrl: '',
      stripUrl: '',
      thumbnailUrl: '',
      profileImageUrl: '',
      productImageUrl: '',
      stampIconUrl: ''
    },
    fields: {
      companyName: '',
      title: '',
      fullName: '',
      customerNumber: '',
      tier: '',
      points: '',
      balance: '',
      currency: 'CHF',
      validUntil: ''
    },
    barcodeConfig: {
      type: 'QR',
      value: '',
      showText: true
    },
    stampConfig: {
      totalStamps: 10,
      collectedStamps: 0,
      rewardText: ''
    },
    layoutConfig: {}
  },
  {
    id: 'loyalty_coffee_blue',
    name: 'Loyalty Card / Treuekarte',
    templateType: 'loyalty',
    previewMode: 'horizontal',
    designConfig: {
      primaryColor: '#4F5FBF',
      secondaryColor: '#ffffff',
      backgroundColor: '#4F5FBF',
      textColor: '#ffffff',
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
      stampIconUrl: ''
    },
    fields: {
      companyName: 'Egli+Vitali AG',
      title: 'Treuekarte',
      fullName: 'Max Muster',
      customerNumber: 'EV-000123',
      tier: 'Gold',
      points: 88,
      balance: '',
      currency: 'CHF',
      validUntil: '31.12.2026'
    },
    barcodeConfig: {
      type: 'QR',
      value: 'EV-000123',
      showText: true
    },
    layoutConfig: {
      logo: { x: 14, y: 12 },
      companyName: { x: 52, y: 14 },
      points: { x: 300, y: 14 },
      image: { x: 14, y: 55 },
      fullName: { x: 14, y: 170 },
      tier: { x: 250, y: 170 }
    }
  },
  {
    id: 'membership_dark_green',
    name: 'Membership Card',
    templateType: 'membership',
    previewMode: 'horizontal',
    designConfig: {
      primaryColor: '#2F3432',
      secondaryColor: '#85C441',
      backgroundColor: '#2F3432',
      textColor: '#ffffff',
      labelColor: '#85C441',
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
      stampIconUrl: ''
    },
    fields: {
      companyName: 'BE STRONG',
      title: 'Membership Card',
      fullName: 'Patsy PassKit',
      customerNumber: 'GYM-1001',
      memberSince: 'April 1, 2020',
      validUntil: '30.03.2026',
      tier: 'Everyday',
      email: 'support@example.com'
    },
    barcodeConfig: {
      type: 'QR',
      value: 'GYM-1001',
      showText: true
    },
    layoutConfig: {
      logo: { x: 16, y: 14 },
      companyName: { x: 48, y: 16 },
      validUntil: { x: 250, y: 16 },
      fullName: { x: 16, y: 72 },
      profileImage: { x: 245, y: 65 },
      memberSince: { x: 16, y: 140 },
      email: { x: 16, y: 175 },
      tier: { x: 255, y: 175 }
    }
  },
  {
    id: 'coupon_fastfood_yellow',
    name: 'Coupon / Gutschein',
    templateType: 'coupon',
    previewMode: 'horizontal',
    designConfig: {
      primaryColor: '#FFC400',
      secondaryColor: '#D71920',
      backgroundColor: '#FFC400',
      textColor: '#111111',
      labelColor: 'rgba(0,0,0,0.65)',
      borderRadius: 16,
      shadow: true
    },
    assets: {
      logoUrl: '',
      productImageUrl: '',
      backgroundUrl: '',
      stripUrl: '',
      thumbnailUrl: ''
    },
    fields: {
      companyName: 'Egli+Vitali AG',
      title: '4 Stk. Nuggets',
      couponHeadline: 'FREE',
      couponSubline: 'Mit jedem Kauf',
      validUntil: '31.12.2026',
      terms: 'Nicht kumulierbar. Nur solange Vorrat.'
    },
    barcodeConfig: {
      type: 'QR',
      value: 'COUPON-FREE-001',
      showText: true
    },
    layoutConfig: {
      logo: { x: 160, y: 20 },
      title: { x: 115, y: 70 },
      couponHeadline: { x: 25, y: 105 },
      productImage: { x: 175, y: 95 },
      couponSubline: { x: 28, y: 158 }
    }
  },
  {
    id: 'event_ticket_dark_blue',
    name: 'Event Ticket / Ticket',
    templateType: 'event_ticket',
    previewMode: 'horizontal',
    designConfig: {
      primaryColor: '#13234A',
      secondaryColor: '#F05A28',
      backgroundColor: '#13234A',
      textColor: '#ffffff',
      labelColor: '#F05A28',
      borderRadius: 16,
      shadow: true
    },
    assets: {
      logoUrl: '',
      backgroundUrl: '',
      stripUrl: '',
      thumbnailUrl: ''
    },
    fields: {
      companyName: 'Event',
      title: 'Rock Festival',
      eventName: 'Rock Festival',
      eventDate: '08.02.2026',
      eventTime: '20:00',
      eventLocation: 'Grand Theatre',
      section: 'A',
      row: '1',
      seat: '28',
      ticketNumber: 'TIC-2026-001'
    },
    barcodeConfig: {
      type: 'PDF417',
      value: 'TIC-2026-001',
      showText: true
    },
    layoutConfig: {
      title: { x: 18, y: 20 },
      eventDate: { x: 18, y: 90 },
      eventLocation: { x: 18, y: 128 },
      row: { x: 185, y: 170 },
      section: { x: 245, y: 170 },
      seat: { x: 310, y: 170 }
    }
  },
  {
    id: 'boarding_pass_blue',
    name: 'Boarding Pass',
    templateType: 'boarding_pass',
    previewMode: 'horizontal',
    designConfig: {
      primaryColor: '#0D1B46',
      secondaryColor: '#2A7FFF',
      backgroundColor: '#0D1B46',
      textColor: '#ffffff',
      labelColor: 'rgba(255,255,255,0.65)',
      borderRadius: 16,
      shadow: true
    },
    assets: {
      logoUrl: '',
      backgroundUrl: '',
      stripUrl: '',
      thumbnailUrl: ''
    },
    fields: {
      companyName: 'PK Airways',
      title: 'Boarding Pass',
      fullName: 'Max Muster',
      departure: 'ZRH',
      destination: 'BER',
      gate: 'B12',
      seat: '14A',
      flightNumber: 'PK852',
      boardingTime: '09:45',
      terminal: '2'
    },
    barcodeConfig: {
      type: 'PDF417',
      value: 'PK852-ZRH-BER-14A',
      showText: true
    },
    layoutConfig: {
      companyName: { x: 16, y: 16 },
      flightNumber: { x: 280, y: 16 },
      departure: { x: 18, y: 70 },
      destination: { x: 220, y: 70 },
      fullName: { x: 18, y: 135 },
      gate: { x: 120, y: 175 },
      seat: { x: 280, y: 175 }
    }
  },
  {
    id: 'gift_card_pink',
    name: 'Gift Card',
    templateType: 'gift_card',
    previewMode: 'horizontal',
    designConfig: {
      primaryColor: '#D62B8A',
      secondaryColor: '#ffffff',
      backgroundColor: '#D62B8A',
      textColor: '#ffffff',
      labelColor: 'rgba(255,255,255,0.75)',
      borderRadius: 16,
      shadow: true
    },
    assets: {
      logoUrl: '',
      backgroundUrl: '',
      stripUrl: '',
      thumbnailUrl: '',
      productImageUrl: ''
    },
    fields: {
      companyName: 'Egli+Vitali AG',
      title: 'Gift Card',
      fullName: '',
      customerNumber: 'GC-000123',
      balance: 88.0,
      currency: 'CHF',
      validUntil: '31.12.2026'
    },
    barcodeConfig: {
      type: 'QR',
      value: 'GC-000123',
      showText: true
    },
    layoutConfig: {
      title: { x: 132, y: 40 },
      image: { x: 0, y: 75 },
      balance: { x: 140, y: 170 }
    }
  },
  {
    id: 'stamp_card_brown',
    name: 'Stamp Card',
    templateType: 'stamp_card',
    previewMode: 'horizontal',
    designConfig: {
      primaryColor: '#805034',
      secondaryColor: '#ffffff',
      backgroundColor: '#805034',
      textColor: '#ffffff',
      labelColor: 'rgba(255,255,255,0.75)',
      borderRadius: 16,
      shadow: true
    },
    assets: {
      logoUrl: '',
      backgroundUrl: '',
      stripUrl: '',
      stampIconUrl: ''
    },
    fields: {
      companyName: 'Café Bonus',
      title: 'Stamp Card',
      customerNumber: 'STAMP-001'
    },
    stampConfig: {
      totalStamps: 10,
      collectedStamps: 3,
      rewardText: '1 Gratisleistung nach 10 Stempeln'
    },
    barcodeConfig: {
      type: 'QR',
      value: 'STAMP-001',
      showText: true
    },
    layoutConfig: {
      companyName: { x: 18, y: 18 },
      stampGrid: { x: 35, y: 70 },
      rewardText: { x: 18, y: 175 }
    }
  },
  {
    id: 'policy_pass_green',
    name: 'Policy Pass',
    templateType: 'policy_pass',
    previewMode: 'horizontal',
    designConfig: {
      primaryColor: '#D7F8BC',
      secondaryColor: '#1A8E8B',
      backgroundColor: '#D7F8BC',
      textColor: '#185B57',
      labelColor: 'rgba(24,91,87,0.65)',
      borderRadius: 16,
      shadow: true
    },
    assets: {
      logoUrl: '',
      backgroundUrl: '',
      stripUrl: '',
      thumbnailUrl: ''
    },
    fields: {
      companyName: 'Health Digital',
      title: 'Policy Pass',
      fullName: 'Max Muster',
      policyName: 'Essential',
      coverage: 'Outpatient Access',
      deductible: 'CHF 300.00',
      coInsurance: 'N/A',
      customerNumber: 'POL-000123'
    },
    barcodeConfig: {
      type: 'QR',
      value: 'POL-000123',
      showText: true
    },
    layoutConfig: {
      logo: { x: 18, y: 16 },
      companyName: { x: 55, y: 18 },
      policyName: { x: 260, y: 18 },
      fullName: { x: 18, y: 80 },
      coverage: { x: 18, y: 130 },
      deductible: { x: 18, y: 170 },
      coInsurance: { x: 250, y: 170 }
    }
  }
];
