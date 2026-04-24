export async function loadConfig() {
  const response = await fetch('./config/supabase.json');
  if (!response.ok) {
    throw new Error('Konfiguration konnte nicht geladen werden.');
  }

  return response.json();
}
