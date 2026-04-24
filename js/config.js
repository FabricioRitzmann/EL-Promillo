const CONFIG_URL = new URL("../config/supabase.json", import.meta.url);

export async function loadConfig() {
  const response = await fetch(CONFIG_URL);

  if (!response.ok) {
    throw new Error("config/supabase.json konnte nicht geladen werden.");
  }

  return response.json();
}
