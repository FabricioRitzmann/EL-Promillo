const CONFIG_PATH = "../config/supabase.json";

export async function loadConfig() {
  const response = await fetch(CONFIG_PATH);

  if (!response.ok) {
    throw new Error("config/supabase.json konnte nicht geladen werden.");
  }

  return response.json();
}
