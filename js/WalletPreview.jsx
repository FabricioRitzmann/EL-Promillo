import React, { useState } from 'react';
import { HorizontalWalletPreview } from './HorizontalWalletPreview';
import { VerticalWalletPreview } from './VerticalWalletPreview';

export default function WalletPreview({ cardData, onChange }) {
  const [previewMode, setPreviewMode] = useState(cardData?.previewMode || 'horizontal');

  function handlePreviewModeChange(mode) {
    setPreviewMode(mode);

    if (onChange) {
      onChange({
        ...cardData,
        previewMode: mode
      });
    }
  }

  return (
    <div className="wallet-preview-wrapper">
      <div className="wallet-preview-toggle">
        <button
          type="button"
          className={previewMode === 'horizontal' ? 'active' : ''}
          onClick={() => handlePreviewModeChange('horizontal')}
        >
          Kreditkartenformat
        </button>

        <button
          type="button"
          className={previewMode === 'vertical' ? 'active' : ''}
          onClick={() => handlePreviewModeChange('vertical')}
        >
          Wallet hochkant
        </button>
      </div>

      {previewMode === 'horizontal' ? (
        <HorizontalWalletPreview cardData={cardData} />
      ) : (
        <VerticalWalletPreview cardData={cardData} />
      )}
    </div>
  );
}
