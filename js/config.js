export const appConfig = {
  supabaseUrl: 'https://fcnnrtkvmkpbnsbhfwee.supabase.co',
  supabaseAnonKey: 'sb_publishable_ai6tT-97fCKJpCWyrHWFXw_IZ2vPDyz',
  // Optional: Externer Endpunkt für echte PassKit-Dateien (.pkpass)
  passkitServiceUrl: ''
};

export const passTemplates = [
  {
    id: 'dark-glass',
    name: 'Dark Glass',
    bg: '#1d1d1f',
    fg: '#ffffff',
    gradient: 'linear-gradient(130deg, #1d1d1f, #3a3a3c)'
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
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
  }
];
