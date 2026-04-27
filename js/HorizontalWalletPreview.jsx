import React from 'react';

export function HorizontalWalletPreview({ cardData }) {
  const { designConfig, fields, assets, stampConfig } = cardData;

  const style = {
    background: designConfig.backgroundColor,
    color: designConfig.textColor,
    borderRadius: `${designConfig.borderRadius}px`
  };

  return (
    <div className="wallet-card-horizontal" style={style}>
      <div className="wallet-card-header">
        {assets.logoUrl && <img src={assets.logoUrl} alt="Logo" />}
        <span>{fields.companyName}</span>
      </div>

      <div className="wallet-card-main">
        <small>{fields.title}</small>
        <h2>{fields.fullName || fields.eventName || fields.title}</h2>
      </div>

      {cardData.templateType === 'loyalty' && (
        <div className="wallet-card-points">
          <small>POINTS</small>
          <strong>{fields.points}</strong>
        </div>
      )}

      {cardData.templateType === 'gift_card' && (
        <div className="wallet-card-balance">
          <small>GUTHABEN</small>
          <strong>
            {fields.currency} {Number(fields.balance || 0).toFixed(2)}
          </strong>
        </div>
      )}

      {cardData.templateType === 'stamp_card' && (
        <div className="stamp-grid">
          {Array.from({ length: stampConfig.totalStamps }).map((_, index) => (
            <span key={index} className={index < stampConfig.collectedStamps ? 'stamp filled' : 'stamp'} />
          ))}
        </div>
      )}

      <div className="wallet-card-footer">
        <div>
          <small>Kundennummer</small>
          <strong>{fields.customerNumber}</strong>
        </div>

        <div>
          <small>Status</small>
          <strong>{fields.tier}</strong>
        </div>
      </div>
    </div>
  );
}
