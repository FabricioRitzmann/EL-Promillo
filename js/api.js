import { appConfig } from './config.js';

const isConfigured =
  appConfig.supabaseUrl &&
  appConfig.supabaseAnonKey &&
  !appConfig.supabaseUrl.includes('YOUR-PROJECT') &&
  !appConfig.supabaseAnonKey.includes('YOUR_PUBLIC_ANON_KEY');

export const supabaseClient = window.supabase.createClient(
  appConfig.supabaseUrl,
  appConfig.supabaseAnonKey
);

function notConfiguredError() {
  return {
    data: null,
    error: {
      message:
        'Supabase ist nicht konfiguriert. Bitte trage in js/config.js eine echte supabaseUrl und supabaseAnonKey ein.'
    }
  };
}

function networkError(error) {
  const isFetchError = error instanceof TypeError;
  return {
    data: null,
    error: {
      message: isFetchError
        ? 'Netzwerkfehler (Failed to fetch). Starte die App über einen lokalen Server (z. B. http://localhost:8080), prüfe Supabase-URL/Key und CORS/Netzwerk.'
        : error.message || 'Unbekannter Fehler'
    }
  };
}

function isMissingRelationError(error, relationName) {
  if (!error) return false;
  const relationHint = `'public.${relationName}'`;
  return error.code === 'PGRST205' || error.message?.includes(relationHint);
}

export async function registerWithEmail(email, password) {
  if (!isConfigured) return notConfiguredError();
  try {
    return await supabaseClient.auth.signUp({ email, password });
  } catch (error) {
    return networkError(error);
  }
}

export async function loginWithEmail(email, password) {
  if (!isConfigured) return notConfiguredError();
  try {
    return await supabaseClient.auth.signInWithPassword({ email, password });
  } catch (error) {
    return networkError(error);
  }
}

export async function requestPasswordOtp(email) {
  if (!isConfigured) return notConfiguredError();
  try {
    return await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.href
    });
  } catch (error) {
    return networkError(error);
  }
}

export async function logout() {
  if (!isConfigured) return notConfiguredError();
  try {
    return await supabaseClient.auth.signOut();
  } catch (error) {
    return networkError(error);
  }
}

export async function savePass(passPayload, userId) {
  if (!isConfigured) return notConfiguredError();
  try {
    const payload = {
      user_id: userId,
      title: passPayload.title,
      subtitle: passPayload.subtitle,
      description: passPayload.description,
      qr_content: passPayload.qrContent,
      template_id: passPayload.templateId,
      icon_id: passPayload.iconId,
      background_template_id: passPayload.backgroundTemplateId,
      background_color: passPayload.backgroundColor,
      foreground_color: passPayload.foregroundColor,
      custom_image_url: passPayload.customImageUrl,
      custom_icon_url: passPayload.customIconUrl,
      custom_banner_url: passPayload.customBannerUrl,
      banner_enabled: passPayload.banner?.enabled ?? false,
      banner_text: passPayload.banner?.text || null,
      banner_preset: passPayload.banner?.preset || null,
      banner_background_color: passPayload.banner?.backgroundColor || null,
      banner_text_color: passPayload.banner?.textColor || null,
      banner_shape: passPayload.banner?.shape || 'pill',
      banner_width: passPayload.banner?.width ?? 60,
      banner_height: passPayload.banner?.height ?? 42,
      banner_position_x: passPayload.banner?.positionX ?? 4,
      banner_position_y: passPayload.banner?.positionY ?? 4,
      card_program_type: passPayload.cardProgramType,
      program_config: passPayload.programConfig,
      push_enabled: passPayload.pushEnabled,
      notification_rules: passPayload.notificationRules
    };

    if (passPayload.id) {
      return await supabaseClient.from('wallet_passes').update(payload).eq('id', passPayload.id).eq('user_id', userId);
    }

    return await supabaseClient.from('wallet_passes').insert(payload);
  } catch (error) {
    return networkError(error);
  }
}

export async function listPasses(userId) {
  if (!isConfigured) return notConfiguredError();
  try {
    return await supabaseClient
      .from('wallet_passes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  } catch (error) {
    return networkError(error);
  }
}

export async function addCompletionStat(userId, passId, passTitle) {
  if (!isConfigured) return notConfiguredError();
  try {
    const response = await supabaseClient.from('pass_completion_stats').insert({
      user_id: userId,
      pass_id: passId,
      pass_title: passTitle,
      completed_at: new Date().toISOString()
    });
    if (isMissingRelationError(response.error, 'pass_completion_stats')) {
      return { data: null, error: null };
    }
    return response;
  } catch (error) {
    if (isMissingRelationError(error, 'pass_completion_stats')) {
      return { data: null, error: null };
    }
    return networkError(error);
  }
}

export async function listPassStats(userId) {
  if (!isConfigured) return notConfiguredError();
  try {
    const response = await supabaseClient
      .from('pass_completion_stats')
      .select('pass_title, completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });
    if (isMissingRelationError(response.error, 'pass_completion_stats')) {
      return { data: [], error: null };
    }
    return response;
  } catch (error) {
    if (isMissingRelationError(error, 'pass_completion_stats')) {
      return { data: [], error: null };
    }
    return networkError(error);
  }
}

export async function uploadCustomImage(file, userId) {
  if (!isConfigured) return notConfiguredError();
  const extension = file.name.split('.').pop();
  const objectPath = `${userId}/${crypto.randomUUID()}.${extension}`;

  let uploadResponse;
  try {
    uploadResponse = await supabaseClient.storage
      .from('pass-backgrounds')
      .upload(objectPath, file, { upsert: false });
  } catch (error) {
    return networkError(error);
  }

  if (uploadResponse.error) {
    return uploadResponse;
  }

  const { data } = supabaseClient.storage
    .from('pass-backgrounds')
    .getPublicUrl(objectPath);

  return { data: { path: objectPath, publicUrl: data.publicUrl }, error: null };
}
