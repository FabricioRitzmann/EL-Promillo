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
        .eq('user_id', userId)
        .select('id')
        .single();
    }
    return supabaseClient.from('wallet_passes').insert(activePayload).select('id').single();
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
    return await supabaseClient.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false
      }
    });
  } catch (error) {
    return networkError(error);
  }
}

export async function requestPasswordResetLink(email, redirectTo) {
  if (!isConfigured) return notConfiguredError();
  try {
    return await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || window.location.href
    });
  } catch (error) {
    return networkError(error);
  }
}

export async function updateCurrentUserPassword(newPassword) {
  if (!isConfigured) return notConfiguredError();
  try {
    return await supabaseClient.auth.updateUser({
      password: newPassword
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
      passkit_config: passPayload.passkitConfig || {},
      wallet_template_config: passPayload.walletTemplateConfig || null
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

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function buildQrImageUrl(content) {
  const encodedContent = encodeURIComponent(content || '');
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=0&data=${encodedContent}`;
}

function buildExportRow(entry) {
  const cardTitle = escapeHtml(entry.title || 'Ohne Titel');
  const subtitle = escapeHtml(entry.subtitle || '');
  const description = escapeHtml(entry.description || '');
  const businessName = escapeHtml(entry.business_name || 'Unbekannter Betrieb');
  const backgroundColor = escapeHtml(entry.background_color || '#1f6feb');
  const foregroundColor = escapeHtml(entry.foreground_color || '#ffffff');
  const qrImage = buildQrImageUrl(entry.qr_content || '');
  const qrContent = escapeHtml(entry.qr_content || '');

  return `
    <tr>
      <td class="card-col">
        <div class="credit-card" style="background:${backgroundColor}; color:${foregroundColor};">
          <div class="card-label">KARTE</div>
          <div class="card-title">${cardTitle}</div>
          <div class="card-subtitle">${subtitle}</div>
          <div class="card-business">${businessName}</div>
          <div class="card-description">${description}</div>
        </div>
      </td>
      <td class="qr-col">
        <img class="qr-image" src="${qrImage}" alt="QR Code" />
        <div class="qr-content">${qrContent}</div>
      </td>
    </tr>
  `;
}

export function createPassesExcelExport(entries = []) {
  const safeEntries = Array.isArray(entries) ? entries : [];

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; padding: 8px; }
          table { border-collapse: separate; border-spacing: 0 8px; }
          td { vertical-align: middle; }
          .card-col { width: 330px; padding-right: 16px; }
          .qr-col { width: 200px; text-align: center; }
          .credit-card {
            width: 85.6mm;
            height: 53.98mm;
            border-radius: 12px;
            box-sizing: border-box;
            padding: 10px;
            overflow: hidden;
          }
          .card-label { font-size: 10px; letter-spacing: 0.08em; opacity: 0.8; }
          .card-title { margin-top: 8px; font-size: 18px; font-weight: 700; }
          .card-subtitle { margin-top: 4px; font-size: 13px; opacity: 0.95; }
          .card-business { margin-top: 12px; font-size: 12px; font-weight: 600; }
          .card-description { margin-top: 4px; font-size: 11px; opacity: 0.9; }
          .qr-image { width: 45mm; height: 45mm; object-fit: contain; display: block; margin: 0 auto; }
          .qr-content { margin-top: 6px; font-size: 9px; color: #333; word-break: break-all; max-width: 180px; }
        </style>
      </head>
      <body>
        <table>
          ${safeEntries.map((entry) => buildExportRow(entry)).join('\n')}
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([`\ufeff${html}`], {
    type: 'application/vnd.ms-excel;charset=utf-8;'
  });

  const timestamp = new Date().toISOString().replaceAll(':', '-').slice(0, 19);
  const fileName = `karten-export-${timestamp}.xls`;
  const downloadUrl = URL.createObjectURL(blob);

  return {
    fileName,
    downloadUrl
  };
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
    return await supabaseClient
      .from('business_scan_stats_anonymized')
      .select('*')
      .eq('business_user_id', userId)
      .order('last_event_at', { ascending: false });
  } catch (error) {
    return networkError(error);
  }
}
