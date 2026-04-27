import React from 'react';

export function VerticalWalletPreview({ cardData }) {
  const { designConfig, fields, assets, barcodeConfig } = cardData;

  const style = {
    background: designConfig.backgroundColor,
    color: designConfig.textColor,
    borderRadius: `${designConfig.borderRadius + 10}px`
  };

  return (
    <div className="wallet-card-vertical" style={style}>
      <div className="wallet-vertical-header">
        {assets.logoUrl && <img src={assets.logoUrl} alt="Logo" />}
        <span>{fields.companyName}</span>
      </div>

      <div className="wallet-vertical-main">
        <small>{fields.title}</small>
        <h1>{fields.fullName || fields.eventName || fields.title}</h1>
      </div>

      <div className="wallet-vertical-fields">
        {fields.points !== '' && (
          <div>
            <small>Punkte</small>
            <strong>{fields.points}</strong>
          </div>
        )}

        {fields.balance !== '' && (
          <div>
            <small>Guthaben</small>
            <strong>
              {fields.currency} {Number(fields.balance || 0).toFixed(2)}
            </strong>
          </div>
        )}

        {fields.validUntil && (
          <div>
            <small>Gültig bis</small>
            <strong>{fields.validUntil}</strong>
          </div>
        )}

        {fields.customerNumber && (
          <div>
            <small>Kundennummer</small>
            <strong>{fields.customerNumber}</strong>
          </div>
        )}
      </div>

      <div className="wallet-code-area">
        <CodePreview type={barcodeConfig.type} value={barcodeConfig.value || fields.customerNumber} />

        {barcodeConfig.showText && <p>{barcodeConfig.value || fields.customerNumber}</p>}
      </div>
    </div>
  );
}

function CodePreview({ type, value }) {
  if (type === 'PDF417') {
    return (
      <div className="fake-pdf417">
        <span>{value}</span>
      </div>
    );
  }

  if (type === 'BARCODE') {
    return (
      <div className="fake-barcode">
        <span>{value}</span>
      </div>
    );
  }

  return (
    <div className="fake-qr">
      <span>{value}</span>
    </div>
  );
}
