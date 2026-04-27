import { mapToApplePass } from './applePassMapper.js';
import { mapToGoogleWallet } from './googleWalletMapper.js';
import { mapToSamsungWallet } from './samsungWalletMapper.js';

export function mapWalletCardForExport(cardData, platform) {
  switch (platform) {
    case 'apple':
      return mapToApplePass(cardData);
    case 'google':
      return mapToGoogleWallet(cardData);
    case 'samsung':
      return mapToSamsungWallet(cardData);
    default:
      throw new Error(`Unbekannte Wallet-Plattform: ${platform}`);
  }
}
