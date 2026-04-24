let supabaseClient = null;

export function setClient(client) {
  supabaseClient = client;
}

function requireClient() {
  if (!supabaseClient) {
    throw new Error('Supabase Client ist nicht initialisiert.');
  }

  return supabaseClient;
}

export async function signUp(email, password) {
  const { error } = await requireClient().auth.signUp({ email, password });
  if (error) throw error;
}

export async function signIn(email, password) {
  const { error } = await requireClient().auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await requireClient().auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await requireClient().auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function createCard(card) {
  const { error } = await requireClient().from('wallet_cards').insert(card);
  if (error) throw error;
}

export async function listCards() {
  const { data, error } = await requireClient()
    .from('wallet_cards')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createTransaction(transaction) {
  const { error } = await requireClient().from('wallet_transactions').insert(transaction);
  if (error) throw error;
}

export async function listTransactions() {
  const { data, error } = await requireClient()
    .from('wallet_transactions')
    .select('id, card_id, kind, amount, note, created_at, wallet_cards(name)')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data;
}

export async function createOffer(offer) {
  const { error } = await requireClient().from('wallet_offers').insert(offer);
  if (error) throw error;
}

export async function listOffers() {
  const { data, error } = await requireClient()
    .from('wallet_offers')
    .select('*')
    .order('valid_until', { ascending: true });

  if (error) throw error;
  return data;
}

export async function updateCardBalance(cardId, nextBalance) {
  const { error } = await requireClient().from('wallet_cards').update({ balance: nextBalance }).eq('id', cardId);
  if (error) throw error;
}
