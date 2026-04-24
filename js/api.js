import { loadConfig } from "./config.js";

let supabaseClient = null;

export async function initApi() {
  const config = await loadConfig();
  supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
}

function ensureClient() {
  if (!supabaseClient) {
    throw new Error("Supabase ist nicht initialisiert.");
  }
}

export async function fetchPasses() {
  ensureClient();

  const { data, error } = await supabaseClient
    .from("passes")
    .select("id, name, template, organization_name, updated_at")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchPassById(id) {
  ensureClient();

  const { data, error } = await supabaseClient
    .from("passes")
    .select("*, pass_fields(key, value)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function upsertPass(pass, fields) {
  ensureClient();

  const { data, error } = await supabaseClient
    .from("passes")
    .upsert(pass, { onConflict: "id" })
    .select("id")
    .single();

  if (error) throw error;

  const passId = data.id;

  await supabaseClient.from("pass_fields").delete().eq("pass_id", passId);

  const payload = Object.entries(fields).map(([key, value]) => ({
    pass_id: passId,
    key,
    value,
  }));

  if (payload.length > 0) {
    const { error: fieldsError } = await supabaseClient.from("pass_fields").insert(payload);
    if (fieldsError) throw fieldsError;
  }

  return passId;
}

export function buildPassJson(pass, fields) {
  return {
    description: pass.description || "Wallet Pass erstellt mit Wallet Pass Studio",
    formatVersion: 1,
    organizationName: pass.organization_name,
    serialNumber: pass.id,
    teamIdentifier: "DEMO_TEAM_IDENTIFIER",
    passTypeIdentifier: "pass.com.example.wallet",
    backgroundColor: pass.background_color,
    foregroundColor: pass.foreground_color,
    labelColor: pass.label_color,
    logoText: pass.name,
    barcode: {
      format: "PKBarcodeFormatQR",
      message: pass.barcode_message || pass.id,
      messageEncoding: "iso-8859-1",
    },
    [pass.template]: {
      primaryFields: Object.entries(fields)
        .slice(0, 2)
        .map(([key, value]) => ({ key, label: key.replaceAll("_", " "), value })),
      secondaryFields: Object.entries(fields)
        .slice(2, 4)
        .map(([key, value]) => ({ key, label: key.replaceAll("_", " "), value })),
      auxiliaryFields: Object.entries(fields)
        .slice(4)
        .map(([key, value]) => ({ key, label: key.replaceAll("_", " "), value })),
    },
  };
}
