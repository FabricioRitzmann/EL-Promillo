function formatMoney(value) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(Number(value || 0));
}

export function showMessage(message, isError = false) {
  const box = document.getElementById('message-box');
  box.textContent = message;
  box.classList.toggle('error', isError);
  box.style.display = 'block';

  window.setTimeout(() => {
    box.style.display = 'none';
  }, 3200);
}

export function renderSummary(cards, transactions, offers) {
  const totalBalance = cards.reduce((sum, card) => sum + Number(card.balance || 0), 0);

  const items = [
    { label: 'Karten gesamt', value: cards.length },
    { label: 'Gesamtguthaben', value: formatMoney(totalBalance) },
    { label: 'Letzte Transaktionen', value: transactions.length },
    { label: 'Aktive Angebote', value: offers.length }
  ];

  const summary = document.getElementById('wallet-summary');
  summary.innerHTML = items
    .map((item) => `<article class="summary-card"><strong>${item.value}</strong><br /><span>${item.label}</span></article>`)
    .join('');
}

export function renderCards(cards) {
  const list = document.getElementById('cards-list');

  if (!cards.length) {
    list.innerHTML = '<p>Noch keine Karte vorhanden.</p>';
    return;
  }

  list.innerHTML = cards
    .map((card) => {
      const expiry = card.expires_at ? new Date(card.expires_at).toLocaleDateString('de-DE') : 'Kein Ablaufdatum';
      return `
        <article class="wallet-card">
          <h3>${card.name}</h3>
          <p>Typ: ${card.kind}</p>
          <p>Guthaben: ${formatMoney(card.balance)}</p>
          <p>Ablauf: ${expiry}</p>
          <p class="card-code">Code: ${card.code || '—'}</p>
        </article>
      `;
    })
    .join('');
}

export function renderTransactions(transactions) {
  const list = document.getElementById('transactions-list');

  if (!transactions.length) {
    list.innerHTML = '<li>Keine Transaktionen vorhanden.</li>';
    return;
  }

  list.innerHTML = transactions
    .map((tx) => {
      const cardName = tx.wallet_cards?.name || 'Unbekannte Karte';
      const amountPrefix = tx.kind === 'payment' ? '-' : '+';
      return `<li>${new Date(tx.created_at).toLocaleString('de-DE')} · ${cardName} · ${tx.kind} · ${amountPrefix}${formatMoney(tx.amount)} · ${tx.note || 'Ohne Notiz'}</li>`;
    })
    .join('');
}

export function renderOffers(offers) {
  const list = document.getElementById('offers-list');

  if (!offers.length) {
    list.innerHTML = '<li>Keine Angebote vorhanden.</li>';
    return;
  }

  list.innerHTML = offers
    .map((offer) => `<li><strong>${offer.title}</strong><br />Gültig bis: ${new Date(offer.valid_until).toLocaleDateString('de-DE')}</li>`)
    .join('');
}

export function updateCardSelect(cards) {
  const select = document.getElementById('transaction-card');
  select.innerHTML = cards.map((card) => `<option value="${card.id}">${card.name}</option>`).join('');
}
