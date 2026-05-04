export const walletTemplates = {
  apple: {
    id: 'apple_default',
    walletType: 'apple',
    name: 'Apple Generic Pass',
    passType: 'generic',
    viewModes: ['verticalFront', 'verticalBack', 'horizontalCard'],
    branding: {
      logoUrl: '',
      logoText: 'Brand Name',
      heroImageUrl: '',
      thumbnailUrl: '',
      backgroundColor: '#111827',
      foregroundColor: '#ffffff',
      labelColor: '#d1d5db',
      accentColor: '#3b82f6'
    },
    fields: {
      headerFields: [{ key: 'validUntil', label: 'Gültig bis', value: '31.12.2026' }],
      primaryFields: [{ key: 'title', label: 'Titel', value: 'Premium Pass' }],
      secondaryFields: [{ key: 'customer', label: 'Kunde', value: 'Max Muster' }],
      auxiliaryFields: [{ key: 'status', label: 'Status', value: 'Aktiv' }],
      backFields: [{ key: 'info', label: 'Information', value: 'Weitere Informationen zum Pass.' }]
    },
    barcode: { enabled: true, type: 'QR', value: 'https://example.com/pass/123456', altText: '123456', showInVertical: true, showInHorizontal: false, showInBack: false }
  },
  google: {
    id: 'google_default',
    walletType: 'google',
    name: 'Google Generic Pass',
    passType: 'generic',
    viewModes: ['cardView', 'detailView'],
    branding: { logoUrl: '', logoText: 'Brand Name', heroImageUrl: '', thumbnailUrl: '', backgroundColor: '#ffffff', foregroundColor: '#111827', labelColor: '#6b7280', accentColor: '#4285f4' },
    fields: {
      cardTitle: { key: 'title', label: 'Titel', value: 'Google Wallet Pass' },
      subtitle: { key: 'subtitle', label: 'Untertitel', value: 'Membership' },
      primaryFields: [{ key: 'main', label: 'Hauptinfo', value: 'Premium Member' }],
      secondaryFields: [{ key: 'points', label: 'Punkte', value: "2'450" }],
      detailFields: [{ key: 'memberId', label: 'Mitglied Nr.', value: '123456' }]
    },
    barcode: { enabled: true, type: 'QR', value: 'https://example.com/google/123456', altText: '123456', showInCardView: false, showInDetailView: true }
  },
  samsung: {
    id: 'samsung_default',
    walletType: 'samsung',
    name: 'Samsung Membership Card',
    passType: 'membership',
    viewModes: ['quickAccessView', 'detailView'],
    branding: { logoUrl: '', logoText: 'Samsung Wallet Pass', heroImageUrl: '', thumbnailUrl: '', backgroundColor: '#0f3d91', foregroundColor: '#ffffff', labelColor: '#dbeafe', accentColor: '#60a5fa' },
    fields: {
      cardTitle: { key: 'title', label: 'Titel', value: 'Samsung Wallet Card' },
      primaryFields: [{ key: 'main', label: 'Hauptinfo', value: 'Premium Card' }],
      secondaryFields: [{ key: 'customer', label: 'Kunde', value: 'Max Muster' }],
      detailFields: [{ key: 'status', label: 'Status', value: 'Aktiv' }]
    },
    barcode: { enabled: true, type: 'QR', value: 'https://example.com/samsung/123456', altText: '123456', showInQuickAccessView: true, showInDetailView: true }
  }
};
