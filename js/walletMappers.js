function mapBarcodeTypeForApple(type) {
  const map = {
    QR: 'PKBarcodeFormatQR',
    PDF417: 'PKBarcodeFormatPDF417',
    Code128: 'PKBarcodeFormatCode128'
  };
  return map[type] || 'PKBarcodeFormatQR';
}

function mapBarcodeTypeForGoogle(type) {
  const map = {
    QR: 'QR_CODE',
    PDF417: 'PDF_417',
    Code128: 'CODE_128'
  };
  return map[type] || 'QR_CODE';
}

function shouldIncludeBarcode(payload) {
  return (payload.previewMode || 'horizontal') === 'vertical';
}

export function mapEditorToApplePass(payload) {
  const fields = payload.fields || {};
  const passkit = payload.passkitConfig || {};
  const barcodeMessage = payload.passkitConfig?.barcode?.message || payload.barcodeConfig?.value || payload.qrContent || '';
  const barcodePayload = shouldIncludeBarcode(payload)
    ? {
        barcode: {
          format: mapBarcodeTypeForApple(payload.barcodeConfig?.type),
          message: barcodeMessage,
          messageEncoding: passkit.barcode?.messageEncoding || 'utf-8',
          altText: passkit.barcode?.altText || ''
        },
        barcodes: [
          {
            format: mapBarcodeTypeForApple(payload.barcodeConfig?.type),
            message: barcodeMessage,
            messageEncoding: passkit.barcode?.messageEncoding || 'utf-8',
            altText: passkit.barcode?.altText || ''
          }
        ]
      }
    : {};

  return {
    passType: passkit.passType || 'generic',
    passTypeIdentifier: passkit.passTypeIdentifier || 'pass.com.example.default',
    teamIdentifier: passkit.teamIdentifier || '',
    description: payload.title || fields.title || 'Wallet Card',
    organizationName: passkit.organizationName || fields.companyName || payload.businessName || 'Business',
    serialNumber: passkit.serialNumber || crypto.randomUUID(),
    formatVersion: 1,
    foregroundColor: passkit.foregroundColor || 'rgb(255,255,255)',
    backgroundColor: passkit.backgroundColor || 'rgb(0,0,0)',
    labelColor: passkit.labelColor || 'rgb(200,200,200)',
    relevantDate: passkit.relevantDate || undefined,
    locations: passkit.location?.latitude && passkit.location?.longitude ? [passkit.location] : [],
    ...barcodePayload,
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
  const barcodeValue = payload.barcodeConfig?.value || payload.qrContent || '';
  const barcodePayload = shouldIncludeBarcode(payload)
    ? {
        barcode: {
          type: mapBarcodeTypeForGoogle(payload.barcodeConfig?.type),
          value: barcodeValue,
          alternateText: payload.barcodeConfig?.showText ? barcodeValue : ''
        }
      }
    : {};
  return {
    issuerName: fields.companyName || payload.businessName || 'Business',
    state: 'ACTIVE',
    classTemplateInfo: { cardTemplateOverride: {} },
    accountId: fields.customerNumber || barcodeValue,
    accountName: fields.fullName || payload.title || 'Wallet User',
    textModulesData: [
      { id: 'name', header: 'Name', body: fields.fullName || '' },
      { id: 'tier', header: 'Tier', body: fields.tier || '' }
    ],
    ...barcodePayload,
    hexBackgroundColor: payload.designConfig?.primaryColor || payload.backgroundColor || '#4654B8'
  };
}

export function mapEditorToSamsungWallet(payload) {
  const fields = payload.fields || {};
  const barcodeValue = payload.barcodeConfig?.value || payload.qrContent || '';
  const barcodePayload = shouldIncludeBarcode(payload)
    ? {
        barcode: {
          type: payload.barcodeConfig?.type || 'QR',
          value: barcodeValue
        }
      }
    : {};
  return {
    card: {
      type: payload.templateType || 'loyalty',
      title: fields.title || payload.title || 'Wallet Card',
      subTitle: fields.fullName || '',
      ...barcodePayload,
      data: {
        memberId: fields.customerNumber || '',
        status: fields.tier || '',
        points: fields.points ?? 0,
        balance: fields.balance ?? 0
      },
      colors: {
        background: payload.backgroundColor || '#1d1d1f',
        foreground: payload.foregroundColor || '#ffffff'
      }
    }
  };
}
