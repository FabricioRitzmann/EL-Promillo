export const appConfig = {
  supabaseUrl: 'https://fcnnrtkvmkpbnsbhfwee.supabase.co',
  supabaseAnonKey: 'sb_publishable_ai6tT-97fCKJpCWyrHWFXw_IZ2vPDyz',
  // Optional: Externer Endpunkt für echte PassKit-Dateien (.pkpass)
  passkitServiceUrl: ''
};

export const passTemplates = [
  {
    id: 'vip-membership',
    name: 'VIP-Mitgliedskarte',
    programType: 'generic',
    defaults: {
      title: 'VIP Membership',
      subtitle: 'Premium Club',
      description: 'Zutritt für Events und Lounge.'
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
      rewardText: 'Jeder 10. Kaffee ist gratis.'
    }
  },
  {
    id: 'streak-card',
    name: 'Streakkarte',
    programType: 'streak',
    defaults: {
      title: '30 Tage Streak',
      subtitle: 'Bleib dran',
      description: 'Jeden Tag ein Check-in für Bonusvorteile.',
      actionDefinition: 'Täglich 1x einchecken',
      targetDays: 30,
      graceHours: 24
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
      lowBalanceThreshold: 5
    }
  },
  {
    id: 'coupon-card',
    name: 'Couponkarte',
    programType: 'generic'
  }
];

export const passDesigns = [
  {
    id: 'dark-glass',
    name: 'Dark Glass',
    bg: '#1d1d1f',
    fg: '#ffffff',
    gradient: 'linear-gradient(130deg, #1d1d1f, #3a3a3c)'
  },
  {
    id: 'oceanic',
    name: 'Oceanic',
    bg: '#0059d6',
    fg: '#ffffff',
    gradient: 'linear-gradient(130deg, #0071e3, #0059d6)'
  },
  {
    id: 'sunset',
    name: 'Sunset',
    bg: '#8220ff',
    fg: '#ffffff',
    gradient: 'linear-gradient(130deg, #ff5f6d, #8220ff)'
  },
  {
    id: 'silver-mist',
    name: 'Silver Mist',
    bg: '#b8bec9',
    fg: '#10203a',
    gradient: 'linear-gradient(130deg, #eef1f6, #bcc5d3)'
  }
];
