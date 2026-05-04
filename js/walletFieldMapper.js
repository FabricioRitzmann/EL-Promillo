export function mapFieldsForWallet(template, walletType) {
  const fields = template?.fields || {};

  if (walletType === 'apple') {
    return {
      header: fields.headerFields || [],
      primary: fields.primaryFields || [],
      secondary: fields.secondaryFields || [],
      auxiliary: fields.auxiliaryFields || [],
      back: fields.backFields || []
    };
  }

  if (walletType === 'google') {
    return {
      cardTitle: fields.cardTitle || { label: 'Titel', value: '' },
      subtitle: fields.subtitle || { label: 'Untertitel', value: '' },
      primary: fields.primaryFields || [],
      secondary: fields.secondaryFields || [],
      detail: fields.detailFields || []
    };
  }

  if (walletType === 'samsung') {
    return {
      cardTitle: fields.cardTitle || { label: 'Titel', value: '' },
      primary: fields.primaryFields || [],
      secondary: fields.secondaryFields || [],
      detail: fields.detailFields || []
    };
  }

  return {};
}
