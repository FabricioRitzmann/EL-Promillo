import { backgroundTemplates, bannerColorOptions, passTemplates, streakIcons, templateIcons } from './config.js';

export const ui = {
  authState: document.getElementById('auth-state'),
  logoutBtn: document.getElementById('logout-btn'),
  authCard: document.getElementById('auth-card'),
  editorCard: document.getElementById('editor-card'),
  savedCard: document.getElementById('saved-card'),
  toast: document.getElementById('toast'),
  passList: document.getElementById('saved-pass-list'),
  notificationRules: document.getElementById('notification-rules'),
  confirmModal: document.getElementById('confirm-modal'),
  confirmTitle: document.getElementById('confirm-title'),
  confirmText: document.getElementById('confirm-text'),
  confirmCancelBtn: document.getElementById('confirm-cancel-btn'),
  confirmOkBtn: document.getElementById('confirm-ok-btn')
};

export const formElements = {
  email: document.getElementById('email'),
  password: document.getElementById('password'),
  title: document.getElementById('pass-title'),
  subtitle: document.getElementById('pass-subtitle'),
  description: document.getElementById('pass-description'),
  qrContent: document.getElementById('pass-qr-content'),
  template: document.getElementById('pass-template'),
  icon: document.getElementById('pass-icon'),
  streakIcon: document.getElementById('streak-icon'),
  bg: document.getElementById('pass-bg'),
  fg: document.getElementById('pass-fg'),
  backgroundTemplate: document.getElementById('pass-background-template'),
  upload: document.getElementById('pass-upload'),
  bannerEnabled: document.getElementById('pass-banner-enabled'),
  bannerText: document.getElementById('pass-banner-text'),
  bannerColor: document.getElementById('pass-banner-color'),
  bannerBg: document.getElementById('pass-banner-bg'),
  bannerFg: document.getElementById('pass-banner-fg'),
  pushEnabled: document.getElementById('push-enabled'),
  addRuleBtn: document.getElementById('add-rule-btn'),
  coffeeTarget: document.getElementById('coffee-target'),
  coffeeCurrent: document.getElementById('coffee-current'),
  coffeeReward: document.getElementById('coffee-reward'),
  streakAction: document.getElementById('streak-action'),
  streakTarget: document.getElementById('streak-target'),
  streakGrace: document.getElementById('streak-grace'),
  creditBalance: document.getElementById('credit-balance'),
  creditCurrency: document.getElementById('credit-currency'),
  creditThreshold: document.getElementById('credit-threshold')
};

let pendingConfirmResolver = null;

function setSelectOptions(selectElement, entries) {
  selectElement.innerHTML = '';
  for (const entry of entries) {
    const option = document.createElement('option');
    option.value = entry.id;
    option.textContent = `${entry.symbol} ${entry.name}`;
    selectElement.appendChild(option);
  }
}

function iconById(collection, id) {
  return collection.find((icon) => icon.id === id) || collection[0];
}

export function getIconSymbol(id) {
  return iconById(templateIcons, id).symbol;
}

export function initTemplateSelect() {
  formElements.template.innerHTML = '';
  for (const template of passTemplates) {
    const option = document.createElement('option');
    option.value = template.id;
    option.textContent = template.name;
    formElements.template.appendChild(option);
  }

  formElements.template.value = passTemplates[0].id;
  setSelectOptions(formElements.icon, templateIcons);
  setSelectOptions(formElements.streakIcon, streakIcons);
  setSelectOptions(formElements.bannerColor, bannerColorOptions.map((entry) => ({ ...entry, symbol: '🎨' })));
  formElements.icon.value = templateIcons[0].id;
  formElements.streakIcon.value = streakIcons[0].id;
  formElements.bannerColor.value = bannerColorOptions[0].id;

  formElements.backgroundTemplate.innerHTML = '';
  const customOption = document.createElement('option');
  customOption.value = 'custom';
  customOption.textContent = '🎛️ Eigene Farbe';
  formElements.backgroundTemplate.appendChild(customOption);

  for (const template of backgroundTemplates) {
    const option = document.createElement('option');
    option.value = template.id;
    option.textContent = `🖼️ ${template.name}`;
    formElements.backgroundTemplate.appendChild(option);
  }
}

export function getTemplateById(id) {
  return passTemplates.find((template) => template.id === id) || passTemplates[0];
}

export function renderProgramFields(programType) {
  document.querySelectorAll('.program-panel').forEach((panel) => panel.classList.add('hidden'));
  const panel = document.getElementById(`program-${programType}`) || document.getElementById('program-generic');
  panel.classList.remove('hidden');

  const streakIconWrap = document.getElementById('streak-icon-wrap');
  streakIconWrap.classList.toggle('hidden', programType !== 'streak');
}

function sanitizeNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function syncBannerFields() {
  const bannerFields = document.getElementById('banner-fields');
  bannerFields.classList.toggle('hidden', !formElements.bannerEnabled.checked);
}

export function applyBannerColorPreset() {
  const preset = bannerColorOptions.find((entry) => entry.id === formElements.bannerColor.value);
  if (!preset) return;
  formElements.bannerBg.value = preset.bgColor;
  formElements.bannerFg.value = preset.textColor;
}

export function applyTemplateDefaults(template) {
  if (!template.defaults) return;
  if (template.defaults.title) {
    formElements.title.value = template.defaults.title;
  }
  if (template.defaults.subtitle) {
    formElements.subtitle.value = template.defaults.subtitle;
  }
  if (template.defaults.description) {
    formElements.description.value = template.defaults.description;
  }

  formElements.icon.value = template.defaults.iconId || templateIcons[0].id;

  if (template.programType === 'coffee') {
    formElements.coffeeTarget.value = template.defaults.stampTarget;
    formElements.coffeeCurrent.value = template.defaults.currentStamps;
    formElements.coffeeReward.value = template.defaults.rewardText;
  }

  if (template.programType === 'streak') {
    formElements.streakAction.value = template.defaults.actionDefinition;
    formElements.streakTarget.value = template.defaults.targetDays;
    formElements.streakGrace.value = template.defaults.graceHours;
    formElements.streakIcon.value = template.defaults.streakIconId || streakIcons[0].id;
  }

  if (template.programType === 'credit') {
    formElements.creditBalance.value = template.defaults.balance;
    formElements.creditCurrency.value = template.defaults.currency;
    formElements.creditThreshold.value = template.defaults.lowBalanceThreshold;
  }
}

export function getProgramConfig(programType) {
  if (programType === 'coffee') {
    return {
      stampTarget: sanitizeNumber(formElements.coffeeTarget.value, 10),
      currentStamps: sanitizeNumber(formElements.coffeeCurrent.value, 0),
      rewardText: formElements.coffeeReward.value.trim()
    };
  }

  if (programType === 'streak') {
    return {
      actionDefinition: formElements.streakAction.value.trim(),
      targetDays: sanitizeNumber(formElements.streakTarget.value, 30),
      graceHours: sanitizeNumber(formElements.streakGrace.value, 24),
      streakIconId: formElements.streakIcon.value
    };
  }

  if (programType === 'credit') {
    return {
      balance: sanitizeNumber(formElements.creditBalance.value, 0),
      currency: formElements.creditCurrency.value.trim().toUpperCase() || 'EUR',
      lowBalanceThreshold: sanitizeNumber(formElements.creditThreshold.value, 5)
    };
  }

  return {};
}

export function addNotificationRule(rule = {}) {
  const row = document.createElement('div');
  row.className = 'rule-row';
  row.innerHTML = `
    <label>
      Regelname
      <input class="rule-name" type="text" placeholder="z. B. Morgen-Reminder" value="${rule.name || ''}" />
    </label>
    <label>
      Trigger-Typ
      <select class="rule-trigger">
        <option value="time" ${rule.triggerType === 'time' ? 'selected' : ''}>Zeitbasiert</option>
        <option value="location" ${rule.triggerType === 'location' ? 'selected' : ''}>Standortbasiert</option>
      </select>
    </label>
    <label>
      Nachricht
      <textarea class="rule-message" rows="2" placeholder="Nachricht an den Nutzer">${rule.message || ''}</textarea>
    </label>
    <div class="rule-time-fields">
      <label>
        Zeitpunkt
        <input class="rule-datetime" type="datetime-local" value="${rule.sendAt || ''}" />
      </label>
    </div>
    <div class="rule-location-fields hidden">
      <label>
        Breitengrad
        <input class="rule-lat" type="number" step="0.000001" value="${rule.latitude ?? ''}" />
      </label>
      <label>
        Längengrad
        <input class="rule-lng" type="number" step="0.000001" value="${rule.longitude ?? ''}" />
      </label>
      <label>
        Radius (Meter)
        <input class="rule-radius" type="number" min="1" value="${rule.radiusMeters ?? 250}" />
      </label>
      <button type="button" class="btn btn-secondary rule-location-btn">Aktuellen Standort nutzen</button>
    </div>
    <button type="button" class="btn btn-danger rule-remove">Regel entfernen</button>
  `;

  const triggerSelect = row.querySelector('.rule-trigger');
  const timeFields = row.querySelector('.rule-time-fields');
  const locationFields = row.querySelector('.rule-location-fields');

  const syncTriggerState = () => {
    const isLocation = triggerSelect.value === 'location';
    locationFields.classList.toggle('hidden', !isLocation);
    timeFields.classList.toggle('hidden', isLocation);
  };

  triggerSelect.addEventListener('change', syncTriggerState);
  syncTriggerState();

  row.querySelector('.rule-remove').addEventListener('click', () => {
    row.remove();
  });

  ui.notificationRules.appendChild(row);
}

export function getNotificationRules() {
  const rows = ui.notificationRules.querySelectorAll('.rule-row');
  return Array.from(rows)
    .map((row) => {
      const triggerType = row.querySelector('.rule-trigger').value;
      const base = {
        name: row.querySelector('.rule-name').value.trim(),
        triggerType,
        message: row.querySelector('.rule-message').value.trim()
      };

      if (triggerType === 'time') {
        return {
          ...base,
          sendAt: row.querySelector('.rule-datetime').value || null
        };
      }

      return {
        ...base,
        latitude: sanitizeNumber(row.querySelector('.rule-lat').value, 0),
        longitude: sanitizeNumber(row.querySelector('.rule-lng').value, 0),
        radiusMeters: sanitizeNumber(row.querySelector('.rule-radius').value, 250)
      };
    })
    .filter((rule) => rule.name && rule.message);
}

export function updatePreview(payload) {
  const preview = document.getElementById('pass-preview');
  const subtitle = document.getElementById('preview-subtitle');
  const title = document.getElementById('preview-title');
  const description = document.getElementById('preview-description');
  const qrImage = document.getElementById('preview-qr');
  const banner = document.getElementById('preview-banner');

  subtitle.textContent = payload.subtitle || 'Standard';
  title.textContent = `${getIconSymbol(payload.iconId)} ${payload.title || 'Neue Karte'}`;
  description.textContent = payload.description || '';

  const selectedBgTemplate = backgroundTemplates.find((entry) => entry.id === payload.backgroundTemplateId);

  if (payload.customImageUrl) {
    preview.style.backgroundImage = `url(${payload.customImageUrl})`;
    preview.style.backgroundSize = 'cover';
    preview.style.backgroundPosition = 'center';
  } else if (selectedBgTemplate) {
    preview.style.backgroundImage = selectedBgTemplate.gradient;
    preview.style.backgroundSize = 'cover';
    preview.style.backgroundPosition = 'center';
  } else {
    preview.style.backgroundImage = 'none';
    preview.style.backgroundColor = payload.backgroundColor;
  }

  preview.style.color = payload.foregroundColor;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    payload.qrContent || 'https://example.com'
  )}`;
  qrImage.src = qrUrl;

  if (payload.banner?.enabled && payload.banner?.text) {
    banner.classList.remove('hidden');
    banner.textContent = payload.banner.text;
    banner.style.backgroundColor = payload.banner.backgroundColor;
    banner.style.color = payload.banner.textColor;
  } else {
    banner.classList.add('hidden');
    banner.textContent = '';
  }
}

export function getPassFormData() {
  const template = getTemplateById(formElements.template.value);
  return {
    title: formElements.title.value.trim(),
    subtitle: formElements.subtitle.value.trim(),
    description: formElements.description.value.trim(),
    qrContent: formElements.qrContent.value.trim(),
    templateId: formElements.template.value,
    iconId: formElements.icon.value,
    backgroundTemplateId: formElements.backgroundTemplate.value,
    backgroundColor: formElements.bg.value,
    foregroundColor: formElements.fg.value,
    banner: {
      enabled: formElements.bannerEnabled.checked,
      text: formElements.bannerText.value.trim(),
      preset: formElements.bannerColor.value,
      backgroundColor: formElements.bannerBg.value,
      textColor: formElements.bannerFg.value
    },
    cardProgramType: template.programType || 'generic',
    programConfig: getProgramConfig(template.programType || 'generic'),
    pushEnabled: formElements.pushEnabled.checked,
    notificationRules: getNotificationRules()
  };
}

export function setAuthenticatedView(email) {
  ui.authState.textContent = email;
  ui.authCard.classList.add('hidden');
  ui.logoutBtn.classList.remove('hidden');
  ui.editorCard.classList.remove('hidden');
  ui.savedCard.classList.remove('hidden');
}

export function setLoggedOutView() {
  ui.authState.textContent = '';
  ui.authCard.classList.remove('hidden');
  ui.logoutBtn.classList.add('hidden');
  ui.editorCard.classList.add('hidden');
  ui.savedCard.classList.add('hidden');
}

export function fillEditorFromSavedPass(entry) {
  formElements.title.value = entry.title || '';
  formElements.subtitle.value = entry.subtitle || '';
  formElements.description.value = entry.description || '';
  formElements.qrContent.value = entry.qr_content || '';
  formElements.template.value = entry.template_id || passTemplates[0].id;
  formElements.icon.value = entry.icon_id || templateIcons[0].id;
  formElements.bg.value = entry.background_color || '#1d1d1f';
  formElements.fg.value = entry.foreground_color || '#ffffff';
  formElements.backgroundTemplate.value = entry.background_template_id || 'custom';
  formElements.pushEnabled.checked = Boolean(entry.push_enabled);
  formElements.bannerEnabled.checked = Boolean(entry.banner_enabled);
  formElements.bannerText.value = entry.banner_text || '';
  formElements.bannerColor.value = entry.banner_preset || bannerColorOptions[0].id;
  formElements.bannerBg.value = entry.banner_background_color || '#f5c451';
  formElements.bannerFg.value = entry.banner_text_color || '#2d1b00';
  syncBannerFields();

  const programConfig = entry.program_config || {};
  formElements.coffeeTarget.value = programConfig.stampTarget ?? 10;
  formElements.coffeeCurrent.value = programConfig.currentStamps ?? 0;
  formElements.coffeeReward.value = programConfig.rewardText ?? '';
  formElements.streakAction.value = programConfig.actionDefinition ?? '';
  formElements.streakTarget.value = programConfig.targetDays ?? 30;
  formElements.streakGrace.value = programConfig.graceHours ?? 24;
  formElements.streakIcon.value = programConfig.streakIconId || streakIcons[0].id;
  formElements.creditBalance.value = programConfig.balance ?? 0;
  formElements.creditCurrency.value = programConfig.currency ?? 'EUR';
  formElements.creditThreshold.value = programConfig.lowBalanceThreshold ?? 5;

  renderProgramFields(entry.card_program_type || 'generic');
  setNotificationRules(entry.notification_rules || []);
}

export function renderSavedPasses(entries) {
  ui.passList.innerHTML = '';
  if (!entries.length) {
    const empty = document.createElement('li');
    empty.textContent = 'Noch keine Karten gespeichert.';
    ui.passList.appendChild(empty);
    return;
  }

  for (const entry of entries) {
    const li = document.createElement('li');
    li.dataset.passId = entry.id;
    const ruleCount = Array.isArray(entry.notification_rules) ? entry.notification_rules.length : 0;
    li.innerHTML = `
      <div>
        <strong>${entry.title}</strong>
        <p class="muted small">${entry.subtitle || 'Kein Untertitel'} · ${new Date(entry.created_at).toLocaleString('de-DE')}</p>
        <p class="muted small">Typ: ${entry.card_program_type || 'generic'} · Push-Regeln: ${ruleCount}</p>
      </div>
      <div class="row-buttons">
        <button type="button" class="btn btn-secondary open-pass-btn">Öffnen</button>
        <a class="btn btn-secondary" href="https://api.qrserver.com/v1/create-qr-code/?size=420x420&data=${encodeURIComponent(
          entry.qr_content
        )}" target="_blank" rel="noreferrer">QR öffnen</a>
      </div>
    `;
    ui.passList.appendChild(li);
  }
}

export function onSavedPassOpen(handler) {
  ui.passList.addEventListener('click', (event) => {
    const button = event.target.closest('.open-pass-btn');
    if (!button) return;
    const row = button.closest('li[data-pass-id]');
    if (!row) return;
    handler(row.dataset.passId);
  });
}

export function resetNotificationRules() {
  ui.notificationRules.innerHTML = '';
}

export function setNotificationRules(rules) {
  resetNotificationRules();
  if (!rules.length) {
    return;
  }

  rules.forEach((rule) => addNotificationRule(rule));
}

export function askForConfirmation({ title, message, confirmLabel = 'Bestätigen' }) {
  if (pendingConfirmResolver) {
    pendingConfirmResolver(false);
    pendingConfirmResolver = null;
  }

  ui.confirmTitle.textContent = title;
  ui.confirmText.textContent = message;
  ui.confirmOkBtn.textContent = confirmLabel;
  ui.confirmModal.classList.remove('hidden');

  return new Promise((resolve) => {
    pendingConfirmResolver = resolve;
  });
}

function closeConfirmation(result) {
  if (!pendingConfirmResolver) return;
  const resolver = pendingConfirmResolver;
  pendingConfirmResolver = null;
  ui.confirmModal.classList.add('hidden');
  resolver(result);
}

ui.confirmCancelBtn.addEventListener('click', () => closeConfirmation(false));
ui.confirmOkBtn.addEventListener('click', () => closeConfirmation(true));
ui.confirmModal.addEventListener('click', (event) => {
  if (event.target === ui.confirmModal) {
    closeConfirmation(false);
  }
});

export function showToast(message, isError = false) {
  ui.toast.textContent = message;
  ui.toast.style.background = isError ? '#b42318' : '#111';
  ui.toast.classList.remove('hidden');
  setTimeout(() => ui.toast.classList.add('hidden'), 3200);
}
