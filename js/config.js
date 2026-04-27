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
    id: 'loyalty',
    name: 'Loyalty Card',
    programType: 'loyalty',
    defaults: { title: 'Treuekarte', subtitle: 'Loyalty Card', description: 'Sammle Punkte und erreiche neue Stufen.', iconId: 'gift' }
  },
  {
    id: 'membership',
    name: 'Membership Card',
    programType: 'membership',
    defaults: { title: 'Membership', subtitle: 'Member Card', description: 'Mitgliedschaft mit Status und Laufzeit.', iconId: 'menu-card' }
  },
  {
    id: 'coupon',
    name: 'Coupon',
    programType: 'coupon',
    defaults: { title: 'Special Offer', subtitle: 'Coupon', description: 'Zeige diesen Coupon beim Checkout.', iconId: 'gift' }
  },
  {
    id: 'event_ticket',
    name: 'Event Ticket',
    programType: 'event_ticket',
    defaults: { title: 'Event Ticket', subtitle: 'General Admission', description: 'Zutritt zum Event.', iconId: 'soccer-ball' }
  },
  {
    id: 'boarding_pass',
    name: 'Boarding Pass',
    programType: 'boarding_pass',
    defaults: { title: 'Boarding Pass', subtitle: 'Flight', description: 'Check-in und Boarding Information.', iconId: 'running' }
  },
  {
    id: 'gift_card',
    name: 'Gift Card',
    programType: 'gift_card',
    defaults: { title: 'Gift Card', subtitle: 'Geschenkkarte', description: 'Aktuelles Guthaben und Barcode.', iconId: 'gift' }
  },
  {
    id: 'stamp_card',
    name: 'Stamp Card',
    programType: 'stamp_card',
    defaults: {
      title: 'Stamp Card',
      subtitle: 'Sammelkarte',
      description: 'Sammle Stempel für deine Belohnung.',
      stampTarget: 10,
      currentStamps: 0,
      rewardText: 'Jeder 10. Kaffee ist gratis.',
      stampShape: 'circle',
      iconId: 'coffee-cup'
    }
  },
  {
    id: 'policy_pass',
    name: 'Policy Pass',
    programType: 'policy_pass',
    defaults: { title: 'Policy Pass', subtitle: 'Versicherung', description: 'Deckung, Plan und Mitgliedsdaten.', iconId: 'menu-card' }
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
  { id: 'amber', name: 'Amber', bgColor: '#f59e0b', textColor: '#1f1200' },
  { id: 'graphite', name: 'Graphit', bgColor: '#1f2937', textColor: '#f9fafb' },
  { id: 'snow', name: 'Snow', bgColor: '#f9fafb', textColor: '#111827' },
  { id: 'emerald', name: 'Smaragd', bgColor: '#0f766e', textColor: '#ecfeff' },
  { id: 'berry', name: 'Berry', bgColor: '#be185d', textColor: '#fff1f2' },
  { id: 'ocean', name: 'Ocean', bgColor: '#0369a1', textColor: '#e0f2fe' },
  { id: 'violet', name: 'Violett', bgColor: '#6d28d9', textColor: '#f5f3ff' },
  { id: 'sunset', name: 'Sunset', bgColor: '#ea580c', textColor: '#fff7ed' }
];
