export function mapEditorToApplePass(payload) {
  const fields = payload.fields || {};
  return {
    description: payload.title || fields.title || 'Wallet Card',
    organizationName: fields.companyName || payload.businessName || 'Business',
    serialNumber: payload.barcodeConfig?.value || payload.qrContent || crypto.randomUUID(),
    formatVersion: 1,
    barcode: {
      format: payload.barcodeConfig?.type === 'PDF417' ? 'PKBarcodeFormatPDF417' : 'PKBarcodeFormatQR',
      message: payload.barcodeConfig?.value || payload.qrContent || '',
      messageEncoding: 'iso-8859-1'
    },
    generic: {
      primaryFields: [{ key: 'name', label: 'NAME', value: fields.fullName || payload.title || '' }],
      secondaryFields: [
        { key: 'tier', label: 'STATUS', value: fields.tier || '' },
        { key: 'number', label: 'ID', value: fields.customerNumber || '' }
      ],
      auxiliaryFields: [
        { key: 'points', label: 'POINTS', value: String(fields.points ?? '') },
        { key: 'balance', label: 'BALANCE', value: fields.balance ? `${fields.balance} ${fields.currency || ''}` : '' }
      ].filter((entry) => entry.value),
      backFields: [
        { key: 'terms', label: 'Terms', value: payload.backsideConfig?.terms || '' },
        { key: 'support', label: 'Support', value: payload.backsideConfig?.supportEmail || '' }
      ].filter((entry) => entry.value)
    }
  };
}

export function mapEditorToGoogleWallet(payload) {
  const fields = payload.fields || {};
  return {
    classTemplateInfo: { cardTemplateOverride: {} },
    textModulesData: [
      { id: 'name', header: 'Name', body: fields.fullName || '' },
      { id: 'tier', header: 'Tier', body: fields.tier || '' }
    ],
    barcode: {
      type: payload.barcodeConfig?.type || 'QR_CODE',
      value: payload.barcodeConfig?.value || payload.qrContent || ''
    },
    hexBackgroundColor: payload.designConfig?.primaryColor || '#4654B8'
  };
}

export function mapEditorToSamsungWallet(payload) {
  const fields = payload.fields || {};
  return {
    card: {
      type: payload.templateType || 'loyalty',
      title: fields.title || payload.title || 'Wallet Card',
      subTitle: fields.fullName || '',
      barcode: payload.barcodeConfig?.value || payload.qrContent || '',
      data: {
        memberId: fields.customerNumber || '',
        status: fields.tier || '',
        points: fields.points ?? 0,
        balance: fields.balance ?? 0
      }
    }
  };
}
