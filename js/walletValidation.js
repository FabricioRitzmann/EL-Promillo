export function validateWalletTemplate(template) {
  const errors = [];
  if (!template?.name?.trim()) errors.push('Template benötigt einen Namen.');
  if (!template?.walletType) errors.push('Wallet Type muss gesetzt sein.');

  if (template?.barcode?.enabled && !template?.barcode?.value?.trim()) {
    errors.push('Barcode Value ist erforderlich, wenn Barcode aktiviert ist.');
  }

  const primaryLength = Array.isArray(template?.fields?.primaryFields)
    ? template.fields.primaryFields.length
    : 0;

  if (template?.passType !== 'blank' && primaryLength === 0) {
    errors.push('Mindestens ein Primary Field ist erforderlich (ausser Blank Template).');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
