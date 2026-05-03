export const appConfig = {
  supabaseUrl: 'https://fcnnrtkvmkpbnsbhfwee.supabase.co',
  supabaseAnonKey: 'sb_publishable_ai6tT-97fCKJpCWyrHWFXw_IZ2vPDyz',
  // Optional: Externer Endpunkt für echte PassKit-Dateien (.pkpass), z. B. https://dein-projekt.supabase.co/functions/v1/passkit
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
    name: 'Stempelkarte',
    programType: 'coffee',
    defaults: {
      title: 'Coffee Club',
      subtitle: 'Sammle Stempel',
      description: 'Treueprogramm für deine täglichen Kaffees.',
      stampTarget: 10,
      currentStamps: 0,
      rewardText: 'Jeder 10. Kaffee ist gratis.',
      stampShape: 'circle',
      iconId: 'coffee-cup'
    }
  },
  {
    id: 'stamp-card',
    name: 'Streak Karte',
    programType: 'streak',
    defaults: {
      title: '30 Tage Stempel-Challenge',
      subtitle: 'Bleib dran',
      description: 'Jeden Tag sammeln und Vorteile freischalten.',
      actionDefinition: 'Täglich 1x einchecken',
      targetDays: 30,
      currentStamps: 0,
      graceHours: 24,
      iconId: 'soccer-ball',
      streakIconId: 'soccer-ball',
      streakShape: 'circle'
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
  { id: 'royal-gold', name: 'Royal Gold', gradient: 'linear-gradient(135deg, #3b2a00 0%, #d4af37 52%, #7a5b00 100%)' },
  { id: 'elegant-silver', name: 'Elegant Silver', gradient: 'linear-gradient(135deg, #2f3640 0%, #c0c7cf 50%, #5f6b7a 100%)' },
  { id: 'elite-platinum', name: 'Elite Platinum', gradient: 'linear-gradient(135deg, #1f2937 0%, #e5e7eb 48%, #6b7280 100%)' },
  { id: 'warm-cafe', name: 'Warmes Café', gradient: 'linear-gradient(135deg, #4a2a1a 0%, #8b5e3c 55%, #2b1a12 100%)' },
  { id: 'stadium-green', name: 'Stadion Grün', gradient: 'linear-gradient(135deg, #163a1f 0%, #2f7c42 50%, #102614 100%)' },
  { id: 'neon-bar', name: 'Neon Bar', gradient: 'linear-gradient(135deg, #140f2e 0%, #442f83 45%, #ff4fa3 100%)' },
  { id: 'craft-bronze', name: 'Craft Bronze', gradient: 'linear-gradient(135deg, #2b160e 0%, #8c4b24 50%, #1f120d 100%)' },
  { id: 'night-lounge', name: 'Night Lounge', gradient: 'linear-gradient(135deg, #101820 0%, #1d3d5a 48%, #0d131a 100%)' },
  { id: 'event-ticket', name: 'Event Ticket', gradient: 'linear-gradient(135deg, #262b49 0%, #6e3ba6 50%, #2e1b57 100%)' }
];

export const bannerColorOptions = [
  { id: 'amber', name: 'Amber', bgColor: '#f59e0b', textColor: '#1f1200' },
  { id: 'graphite', name: 'Graphit', bgColor: '#1f2937', textColor: '#f9fafb' },
  { id: 'snow', name: 'Snow', bgColor: '#f9fafb', textColor: '#111827' },
  { id: 'emerald', name: 'Smaragd', bgColor: '#0f766e', textColor: '#ecfeff' },
  { id: 'berry', name: 'Berry', bgColor: '#be185d', textColor: '#fff1f2' },
  { id: 'ocean', name: 'Ocean', bgColor: '#0369a1', textColor: '#e0f2fe' },
  { id: 'violet', name: 'Violett', bgColor: '#6d28d9', textColor: '#f5f3ff' },
  { id: 'sunset', name: 'Sunset', bgColor: '#ea580c', textColor: '#fff7ed' }
];
