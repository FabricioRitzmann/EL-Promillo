import { appConfig } from './config.js';

export const supabaseClient = window.supabase.createClient(
  appConfig.supabaseUrl,
  appConfig.supabaseAnonKey
);

export async function registerWithEmail(email, password) {
  return supabaseClient.auth.signUp({ email, password });
}

export async function loginWithEmail(email, password) {
  return supabaseClient.auth.signInWithPassword({ email, password });
}

export async function requestPasswordOtp(email) {
  return supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.href
  });
}

export async function logout() {
  return supabaseClient.auth.signOut();
}

export async function savePass(passPayload, userId) {
  return supabaseClient.from('wallet_passes').insert({
    user_id: userId,
    title: passPayload.title,
    subtitle: passPayload.subtitle,
    description: passPayload.description,
    qr_content: passPayload.qrContent,
    template_id: passPayload.templateId,
    background_color: passPayload.backgroundColor,
    foreground_color: passPayload.foregroundColor,
    custom_image_url: passPayload.customImageUrl
  });
}

export async function listPasses(userId) {
  return supabaseClient
    .from('wallet_passes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}

export async function uploadCustomImage(file, userId) {
  const extension = file.name.split('.').pop();
  const objectPath = `${userId}/${crypto.randomUUID()}.${extension}`;

  const uploadResponse = await supabaseClient.storage
    .from('pass-backgrounds')
    .upload(objectPath, file, { upsert: false });

  if (uploadResponse.error) {
    return uploadResponse;
  }

  const { data } = supabaseClient.storage
    .from('pass-backgrounds')
    .getPublicUrl(objectPath);

  return { data: { path: objectPath, publicUrl: data.publicUrl }, error: null };
}
