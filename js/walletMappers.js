import { mapToApplePass } from './applePassMapper.js';
import { mapToGoogleWallet } from './googleWalletMapper.js';
import { mapToSamsungWallet } from './samsungWalletMapper.js';
import { mapWalletCardForExport } from './walletExportMapper.js';

function toWalletCardData(payload = {}) {
  return {
    templateType: payload.templateType,
    fields: payload.fields || {},
    designConfig: {
      backgroundColor: payload.backgroundColor || payload.designConfig?.backgroundColor || payload.designConfig?.primaryColor || '#4654B8',
      textColor: payload.foregroundColor || payload.designConfig?.textColor || '#ffffff',
      labelColor: payload.passkitConfig?.labelColor || payload.designConfig?.labelColor || 'rgba(255,255,255,0.75)'
    },
    barcodeConfig: payload.barcodeConfig || { type: 'QR', value: payload.qrContent || '', showText: true },
    stampConfig: payload.stampConfig,
    backsideConfig: payload.backsideConfig
  };
}

export function mapEditorToApplePass(payload) {
  return mapToApplePass(toWalletCardData(payload));
}

export function mapEditorToGoogleWallet(payload) {
  return mapToGoogleWallet(toWalletCardData(payload));
}

export function mapEditorToSamsungWallet(payload) {
  return mapToSamsungWallet(toWalletCardData(payload));
}

export { mapToApplePass, mapToGoogleWallet, mapToSamsungWallet, mapWalletCardForExport };
