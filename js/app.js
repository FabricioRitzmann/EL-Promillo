import { loadConfig } from './config.js';
import {
  setClient,
  signUp,
  signIn,
  signOut,
  getSession,
  createCard,
  listCards,
  createTransaction,
  listTransactions,
  createOffer,
  listOffers,
  updateCardBalance
} from './api.js';
import {
  showMessage,
  renderSummary,
  renderCards,
  renderTransactions,
  renderOffers,
  updateCardSelect
} from './ui.js';

let currentUserId = null;
let cachedCards = [];

async function initializeApp() {
  try {
    const config = await loadConfig();
    const client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
    setClient(client);

    bindEvents();

    const session = await getSession();
    currentUserId = session?.user?.id || null;

    if (currentUserId) {
      await refreshData();
      showMessage('Session aktiv. Daten wurden geladen.');
    }
  } catch (error) {
    showMessage(error.message, true);
  }
}

function bindEvents() {
  document.getElementById('btn-signup').addEventListener('click', onSignUp);
  document.getElementById('btn-login').addEventListener('click', onLogin);
  document.getElementById('btn-logout').addEventListener('click', onLogout);
  document.getElementById('card-form').addEventListener('submit', onCreateCard);
  document.getElementById('transaction-form').addEventListener('submit', onCreateTransaction);
  document.getElementById('offer-form').addEventListener('submit', onCreateOffer);
}

function readAuthFields() {
  return {
    email: document.getElementById('auth-email').value.trim(),
    password: document.getElementById('auth-password').value
  };
}

async function onSignUp() {
  try {
    const { email, password } = readAuthFields();
    await signUp(email, password);
    showMessage('Registrierung erfolgreich. Bitte E-Mail bestätigen.');
  } catch (error) {
    showMessage(error.message, true);
  }
}

async function onLogin() {
  try {
    const { email, password } = readAuthFields();
    await signIn(email, password);
    const session = await getSession();
    currentUserId = session?.user?.id || null;

    await refreshData();
    showMessage('Login erfolgreich.');
  } catch (error) {
    showMessage(error.message, true);
  }
}

async function onLogout() {
  try {
    await signOut();
    currentUserId = null;
    cachedCards = [];
    renderCards([]);
    renderTransactions([]);
    renderOffers([]);
    renderSummary([], [], []);
    updateCardSelect([]);
    showMessage('Du wurdest ausgeloggt.');
  } catch (error) {
    showMessage(error.message, true);
  }
}

function ensureLoggedIn() {
  if (!currentUserId) {
    throw new Error('Bitte zuerst einloggen.');
  }
}

async function onCreateCard(event) {
  event.preventDefault();

  try {
    ensureLoggedIn();

    const payload = {
      user_id: currentUserId,
      name: document.getElementById('card-name').value.trim(),
      kind: document.getElementById('card-type').value,
      balance: Number(document.getElementById('card-balance').value || 0),
      expires_at: document.getElementById('card-expiry').value || null,
      code: document.getElementById('card-code').value.trim() || null
    };

    await createCard(payload);
    document.getElementById('card-form').reset();
    await refreshData();
    showMessage('Karte wurde gespeichert.');
  } catch (error) {
    showMessage(error.message, true);
  }
}

async function onCreateTransaction(event) {
  event.preventDefault();

  try {
    ensureLoggedIn();

    const cardId = document.getElementById('transaction-card').value;
    const kind = document.getElementById('transaction-type').value;
    const amount = Number(document.getElementById('transaction-amount').value);
    const note = document.getElementById('transaction-description').value.trim();

    const card = cachedCards.find((entry) => entry.id === cardId);
    if (!card) {
      throw new Error('Die ausgewählte Karte existiert nicht.');
    }

    const signedAmount = kind === 'payment' ? -Math.abs(amount) : Math.abs(amount);
    const nextBalance = Number(card.balance) + signedAmount;

    if (nextBalance < 0) {
      throw new Error('Nicht genügend Guthaben auf der Karte.');
    }

    await createTransaction({
      user_id: currentUserId,
      card_id: cardId,
      kind,
      amount: Math.abs(amount),
      note: note || null
    });

    await updateCardBalance(cardId, nextBalance);

    document.getElementById('transaction-form').reset();
    await refreshData();
    showMessage('Transaktion gespeichert.');
  } catch (error) {
    showMessage(error.message, true);
  }
}

async function onCreateOffer(event) {
  event.preventDefault();

  try {
    ensureLoggedIn();

    await createOffer({
      user_id: currentUserId,
      title: document.getElementById('offer-title').value.trim(),
      valid_until: document.getElementById('offer-valid-until').value
    });

    document.getElementById('offer-form').reset();
    await refreshData();
    showMessage('Angebot gespeichert.');
  } catch (error) {
    showMessage(error.message, true);
  }
}

async function refreshData() {
  const [cards, transactions, offers] = await Promise.all([listCards(), listTransactions(), listOffers()]);

  cachedCards = cards;
  renderCards(cards);
  renderTransactions(transactions);
  renderOffers(offers);
  renderSummary(cards, transactions, offers);
  updateCardSelect(cards);
}

initializeApp();
