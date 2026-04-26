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

export const backgroundTemplates = [
  { id: 'warm-cafe', name: 'Warmes Café', gradient: 'linear-gradient(135deg, #4a2a1a 0%, #8b5e3c 55%, #2b1a12 100%)' },
  { id: 'stadium-green', name: 'Stadion Grün', gradient: 'linear-gradient(135deg, #163a1f 0%, #2f7c42 50%, #102614 100%)' },
  { id: 'neon-bar', name: 'Neon Bar', gradient: 'linear-gradient(135deg, #140f2e 0%, #442f83 45%, #ff4fa3 100%)' },
  { id: 'craft-bronze', name: 'Craft Bronze', gradient: 'linear-gradient(135deg, #2b160e 0%, #8c4b24 50%, #1f120d 100%)' },
  { id: 'night-lounge', name: 'Night Lounge', gradient: 'linear-gradient(135deg, #101820 0%, #1d3d5a 48%, #0d131a 100%)' },
  { id: 'event-ticket', name: 'Event Ticket', gradient: 'linear-gradient(135deg, #262b49 0%, #6e3ba6 50%, #2e1b57 100%)' }
];

export const bannerColorOptions = [
  { id: 'gold', name: 'Gold', bgColor: '#f5c451', textColor: '#2d1b00' },
  { id: 'dark', name: 'Dunkel', bgColor: '#1d1d1f', textColor: '#ffffff' },
  { id: 'white', name: 'Weiß', bgColor: '#ffffff', textColor: '#1f2937' },
  { id: 'emerald', name: 'Smaragd', bgColor: '#0b7a5a', textColor: '#ffffff' },
  { id: 'berry', name: 'Berry', bgColor: '#a22968', textColor: '#ffffff' }
];
