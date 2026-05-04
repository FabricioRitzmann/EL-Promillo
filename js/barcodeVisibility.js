export function shouldShowBarcode(template, walletType, viewMode) {
  if (!template?.barcode?.enabled) return false;

  if (walletType === 'apple') {
    if (viewMode === 'verticalFront') return template.barcode.showInVertical === true;
    if (viewMode === 'horizontalCard') return false;
    if (viewMode === 'verticalBack') return template.barcode.showInBack === true;
  }

  if (walletType === 'google') {
    if (viewMode === 'cardView') return template.barcode.showInCardView === true;
    if (viewMode === 'detailView') return template.barcode.showInDetailView === true;
  }

  if (walletType === 'samsung') {
    if (viewMode === 'quickAccessView') return template.barcode.showInQuickAccessView === true;
    if (viewMode === 'detailView') return template.barcode.showInDetailView === true;
  }

  return false;
}

export function toWalletViewMode(walletType, previewMode) {
  if (walletType === 'apple') {
    return previewMode === 'vertical' ? 'verticalFront' : 'horizontalCard';
  }
  if (walletType === 'google') {
    return previewMode === 'vertical' ? 'detailView' : 'cardView';
  }
  if (walletType === 'samsung') {
    return previewMode === 'vertical' ? 'detailView' : 'quickAccessView';
  }
  return 'horizontalCard';
}
