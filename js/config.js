export const appConfig = {
  supabaseUrl: 'https://fcnnrtkvmkpbnsbhfwee.supabase.co',
  supabaseAnonKey: 'sb_publishable_ai6tT-97fCKJpCWyrHWFXw_IZ2vPDyz',
  // Optional: Externer Endpunkt für echte PassKit-Dateien (.pkpass)
  passkitServiceUrl: ''
};

export const passTemplates = [
  {
    id: 'dark-glass',
    name: 'Standard Karte',
    bg: '#1d1d1f',
    fg: '#ffffff',
    gradient: 'linear-gradient(130deg, #1d1d1f, #3a3a3c)',
    programType: 'generic'
  },
  {
    id: 'coffee-stamp',
    name: 'Kaffee Stempelkarte',
    bg: '#5b3526',
    fg: '#ffffff',
    gradient: 'linear-gradient(130deg, #764c34, #3f2418)',
    programType: 'coffee',
    defaults: {
      stampTarget: 10,
      currentStamps: 0,
      rewardText: 'Jeder 10. Kaffee ist gratis.'
    }
  },
  {
    id: 'streak-card',
    name: 'Streakkarte',
    bg: '#3b2cb8',
    fg: '#ffffff',
    gradient: 'linear-gradient(130deg, #5f4bff, #2a1f7f)',
    programType: 'streak',
    defaults: {
      actionDefinition: 'Täglich 1x einchecken',
      targetDays: 30,
      graceHours: 24
    }
  },
  {
    id: 'recharge-credit',
    name: 'Aufladbare Guthabenkarte',
    bg: '#0a6d5a',
    fg: '#ffffff',
    gradient: 'linear-gradient(130deg, #0f8d73, #095043)',
    programType: 'credit',
    defaults: {
      balance: 25,
      currency: 'EUR',
      lowBalanceThreshold: 5
    }
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    bg: '#0059d6',
    fg: '#ffffff',
    gradient: 'linear-gradient(130deg, #0071e3, #0059d6)',
    programType: 'generic'
  },
  {
    id: 'sunset',
    name: 'Sunset',
    bg: '#8220ff',
    fg: '#ffffff',
    gradient: 'linear-gradient(130deg, #ff5f6d, #8220ff)',
    programType: 'generic'
  }
];
