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

function extractMissingSchemaCacheColumn(error) {
  if (!error?.message) return null;
  const match = error.message.match(/could not find the '([^']+)' column of '([^']+)' in the schema cache/i);
  if (!match) return null;
  return {
    column: match[1],
    relation: match[2].replace(/^public\./i, '')
  };
}

async function savePassWithSchemaFallback({ payload, passId, userId }) {
  const attemptSave = (activePayload) => {
    if (passId) {
      return supabaseClient
        .from('wallet_passes')
        .update(activePayload)
        .eq('id', passId)
        .eq('user_id', userId);
    }
    return supabaseClient.from('wallet_passes').insert(activePayload);
  };

  const fallbackPayload = { ...payload };
  const removedColumns = new Set();
  let response = await attemptSave(fallbackPayload);

  while (response?.error) {
    const missingColumnInfo = extractMissingSchemaCacheColumn(response.error);

    if (!missingColumnInfo || missingColumnInfo.relation !== 'wallet_passes') {
      return response;
    }

    if (!(missingColumnInfo.column in fallbackPayload) || removedColumns.has(missingColumnInfo.column)) {
      return response;
    }

    removedColumns.add(missingColumnInfo.column);
    delete fallbackPayload[missingColumnInfo.column];
    response = await attemptSave(fallbackPayload);
  }

  return response;
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48) || 'pass';
}

function buildTemplateStoragePath(passPayload, userId) {
  if (passPayload.templateStoragePath) {
    return passPayload.templateStoragePath;
  }
  const category = slugify(passPayload.businessCategory || 'general');
  const title = slugify(passPayload.title || 'karte');
  return `passes/${userId}/${category}/${title}-${crypto.randomUUID()}.json`;
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
      business_name: passPayload.businessName || null,
      business_category: passPayload.businessCategory || 'restaurant',
      template_storage_path: buildTemplateStoragePath(passPayload, userId),
      template_id: passPayload.templateId,
      icon_id: passPayload.iconId,
      background_template_id: passPayload.backgroundTemplateId,
      wallet_skin: passPayload.walletSkin || 'apple',
      preview_mode: passPayload.previewMode || 'horizontal',
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
      notification_rules: passPayload.notificationRules,
      passkit_enabled: passPayload.passkitConfig?.enabled ?? false,
      passkit_config: passPayload.passkitConfig || {}
    };

    return await savePassWithSchemaFallback({
      payload,
      passId: passPayload.id,
      userId
    });
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

export async function deletePass(passId, userId) {
  if (!isConfigured) return notConfiguredError();
  try {
    return await supabaseClient
      .from('wallet_passes')
      .delete()
      .eq('id', passId)
      .eq('user_id', userId);
  } catch (error) {
    return networkError(error);
  }
}

export async function addCompletionStat(userId, passId, passTitle, cardProgramType = 'generic') {
  if (!isConfigured) return notConfiguredError();
  try {
    const response = await supabaseClient.from('pass_completion_stats').insert({
      user_id: userId,
      pass_id: passId,
      pass_title: passTitle,
      card_program_type: cardProgramType,
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
      .select('pass_title, card_program_type, completed_at')
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


export async function issuePassToWallet({ passId, businessUserId, endUserId, walletProvider = 'apple_wallet' }) {
  if (!isConfigured) return notConfiguredError();
  try {
    const storagePath = `wallet-links/${businessUserId}/${passId}/${endUserId}-${crypto.randomUUID()}.json`;
    return await supabaseClient.from('wallet_pass_instances').insert({
      pass_id: passId,
      business_user_id: businessUserId,
      end_user_id: endUserId,
      wallet_provider: walletProvider,
      wallet_reference_path: storagePath
    }).select('*').single();
  } catch (error) {
    return networkError(error);
  }
}

export async function recordWalletScan({ passInstanceId, passId, businessUserId, eventType = 'scan', pointsDelta = 0 }) {
  if (!isConfigured) return notConfiguredError();
  try {
    return await supabaseClient.from('pass_scan_events').insert({
      pass_instance_id: passInstanceId,
      pass_id: passId,
      business_user_id: businessUserId,
      event_type: eventType,
      points_delta: pointsDelta,
      occurred_at: new Date().toISOString()
    });
  } catch (error) {
    return networkError(error);
  }
}

export async function listBusinessScanStats(userId) {
  if (!isConfigured) return notConfiguredError();
  try {
    const response = await supabaseClient
      .from('business_scan_stats_anonymized')
      .select('*')
      .eq('business_user_id', userId)
      .order('last_event_at', { ascending: false });

    if (response.error?.code === 'PGRST205') {
      return {
        data: [],
        error: {
          ...response.error,
          friendlyMessage: 'Statistik-View ist noch nicht verfügbar. Bitte Migration ausführen und Schema-Cache neu laden.'
        }
      };
    }

    return response;
  } catch (error) {
    return networkError(error);
  }
}
