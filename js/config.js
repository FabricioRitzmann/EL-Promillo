export const appConfig = {
  supabaseUrl: 'https://fcnnrtkvmkpbnsbhfwee.supabase.co',
  supabaseAnonKey: 'sb_publishable_ai6tT-97fCKJpCWyrHWFXw_IZ2vPDyz',
  // Optional: Externer Endpunkt für echte PassKit-Dateien (.pkpass)
  passkitServiceUrl: ''
};

export const templateIcons = [
  { id: 'coffee-cup', name: 'Kaffeetasse', symbol: '☕' },
  { id: 'cocktail', name: 'Cocktail', symbol: '🍸' },
  { id: 'sandwich', name: 'Sandwich', symbol: '🥪' },
  { id: 'menu-card', name: 'Menükarte', symbol: '📋' },
  { id: 'cake', name: 'Kuchen', symbol: '🍰' },
  { id: 'pizza', name: 'Pizza', symbol: '🍕' },
  { id: 'burger', name: 'Burger', symbol: '🍔' },
  { id: 'soccer-ball', name: 'Fußball', symbol: '⚽' },
  { id: 'hockey', name: 'Hockey', symbol: '🏒' },
  { id: 'gift', name: 'Bonus', symbol: '🎁' }
];

export const streakIcons = [
  { id: 'soccer-ball', name: 'Fußball', symbol: '⚽' },
  { id: 'cocktail', name: 'Cocktail', symbol: '🍸' },
  { id: 'hockey', name: 'Hockey', symbol: '🏒' },
  { id: 'coffee-cup', name: 'Kaffee', symbol: '☕' },
  { id: 'sandwich', name: 'Sandwich', symbol: '🥪' },
  { id: 'running', name: 'Laufen', symbol: '🏃' },
  { id: 'flame', name: 'Flamme', symbol: '🔥' }
];

export const passTemplates = [
  {
    id: 'vip-membership',
    name: 'VIP-Mitgliedskarte',
    programType: 'generic',
    defaults: {
      title: 'VIP Membership',
      subtitle: 'Premium Club',
      description: 'Zutritt für Events und Lounge.',
      iconId: 'gift'
    }
  },
  {
    id: 'coffee-stamp',
    name: 'Kaffee Stempelkarte',
    programType: 'coffee',
    defaults: {
      title: 'Coffee Club',
      subtitle: 'Sammle Stempel',
      description: 'Treueprogramm für deine täglichen Kaffees.',
      stampTarget: 10,
      currentStamps: 0,
      rewardText: 'Jeder 10. Kaffee ist gratis.',
      iconId: 'coffee-cup'
    }
  },
  {
    id: 'stamp-card',
    name: 'Stempelkarte',
    programType: 'streak',
    defaults: {
      title: '30 Tage Stempel-Challenge',
      subtitle: 'Bleib dran',
      description: 'Jeden Tag sammeln und Vorteile freischalten.',
      actionDefinition: 'Täglich 1x einchecken',
      targetDays: 30,
      graceHours: 24,
      iconId: 'soccer-ball',
      streakIconId: 'soccer-ball'
    }
  },
  {
    id: 'recharge-credit',
    name: 'Aufladbare Guthabenkarte',
    programType: 'credit',
    defaults: {
      title: 'Store Wallet',
      subtitle: 'Dein Guthaben',
      description: 'Aufladen, bezahlen und Bonus sammeln.',
      balance: 25,
      currency: 'EUR',
      lowBalanceThreshold: 5,
      iconId: 'menu-card'
    }
  },
  {
    id: 'coupon-card',
    name: 'Couponkarte',
    programType: 'generic',
    defaults: {
      iconId: 'gift'
    }
  }
];
