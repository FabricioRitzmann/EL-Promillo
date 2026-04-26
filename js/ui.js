import { backgroundTemplates, bannerColorOptions, passTemplates, streakIcons, templateIcons } from './config.js';

export const ui = {
  authState: document.getElementById('auth-state'),
  logoutBtn: document.getElementById('logout-btn'),
  tabbar: document.getElementById('main-tabbar'),
  authCard: document.getElementById('auth-card'),
  editorCard: document.getElementById('editor-card'),
  savedCard: document.getElementById('saved-card'),
  statsCard: document.getElementById('stats-card'),
  toast: document.getElementById('toast'),
  passList: document.getElementById('saved-pass-list'),
  statsList: document.getElementById('stats-list'),
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
  iconUpload: document.getElementById('pass-icon-upload'),
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
  bannerShape: document.getElementById('pass-banner-shape'),
  bannerWidth: document.getElementById('pass-banner-width'),
  bannerHeight: document.getElementById('pass-banner-height'),
  bannerX: document.getElementById('pass-banner-x'),
  bannerY: document.getElementById('pass-banner-y'),
  bannerUpload: document.getElementById('pass-banner-upload'),
  stampBorderColor: document.getElementById('stamp-border-color'),
  stampSize: document.getElementById('stamp-size'),
  stampBorderWidth: document.getElementById('stamp-border-width'),
  stampOffsetX: document.getElementById('stamp-offset-x'),
  stampOffsetY: document.getElementById('stamp-offset-y'),
  pushEnabled: document.getElementById('push-enabled'),
  addRuleBtn: document.getElementById('add-rule-btn'),
  coffeeTarget: document.getElementById('coffee-target'),
  coffeeCurrent: document.getElementById('coffee-current'),
  coffeeReward: document.getElementById('coffee-reward'),
  coffeeShape: document.getElementById('coffee-shape'),
  streakAction: document.getElementById('streak-action'),
  streakTarget: document.getElementById('streak-target'),
  streakCurrent: document.getElementById('streak-current'),
  streakGrace: document.getElementById('streak-grace'),
  streakShape: document.getElementById('streak-shape'),
  creditBalance: document.getElementById('credit-balance'),
  creditCurrency: document.getElementById('credit-currency'),
  creditThreshold: document.getElementById('credit-threshold')
};

let pendingConfirmResolver = null;
const cardTransitionDurationMs = 260;
const transitionTimers = new WeakMap();

function clearCardTimer(element) {
  const timerId = transitionTimers.get(element);
  if (timerId) {
    clearTimeout(timerId);
    transitionTimers.delete(element);
  }
}

function animateCardIn(element) {
  clearCardTimer(element);
  element.classList.remove('hidden', 'view-exit-active');
  element.classList.add('view-transition', 'view-enter-start');

  requestAnimationFrame(() => {
    element.classList.add('view-enter-active');
    element.classList.remove('view-enter-start');
  });

  const timerId = setTimeout(() => {
    element.classList.remove('view-enter-active');
    transitionTimers.delete(element);
  }, cardTransitionDurationMs);

  transitionTimers.set(element, timerId);
}

function animateCardOut(element) {
  clearCardTimer(element);
  element.classList.add('view-transition', 'view-exit-active');

  const timerId = setTimeout(() => {
    element.classList.add('hidden');
    element.classList.remove('view-exit-active', 'view-enter-active', 'view-enter-start');
    transitionTimers.delete(element);
  }, cardTransitionDurationMs);

  transitionTimers.set(element, timerId);
}

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
  const icon = [...templateIcons, ...streakIcons].find((entry) => entry.id === id);
  return icon?.symbol || '🎯';
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

function clampNumber(value, min, max) {
  return Math.min(Math.max(value, min), max);
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
    formElements.coffeeShape.value = template.defaults.stampShape || 'circle';
  }

  if (template.programType === 'streak') {
    formElements.streakAction.value = template.defaults.actionDefinition;
    formElements.streakTarget.value = template.defaults.targetDays;
    formElements.streakCurrent.value = template.defaults.currentStamps ?? 0;
    formElements.streakGrace.value = template.defaults.graceHours;
    formElements.streakIcon.value = template.defaults.streakIconId || streakIcons[0].id;
    formElements.streakShape.value = template.defaults.streakShape || 'circle';
  }

  if (template.programType === 'credit') {
    formElements.creditBalance.value = template.defaults.balance;
    formElements.creditCurrency.value = template.defaults.currency;
    formElements.creditThreshold.value = template.defaults.lowBalanceThreshold;
  }
}

export function getProgramConfig(programType) {
  const stampStyle = {
    stampBorderColor: formElements.stampBorderColor.value,
    stampSize: sanitizeNumber(formElements.stampSize.value, 42),
    stampBorderWidth: sanitizeNumber(formElements.stampBorderWidth.value, 2),
    stampOffsetX: sanitizeNumber(formElements.stampOffsetX.value, 0),
    stampOffsetY: sanitizeNumber(formElements.stampOffsetY.value, 0)
  };
  if (programType === 'coffee') {
    return {
      stampTarget: sanitizeNumber(formElements.coffeeTarget.value, 10),
      currentStamps: sanitizeNumber(formElements.coffeeCurrent.value, 0),
      rewardText: formElements.coffeeReward.value.trim(),
      stampShape: formElements.coffeeShape.value,
      ...stampStyle
    };
  }

  if (programType === 'streak') {
    return {
      actionDefinition: formElements.streakAction.value.trim(),
      targetDays: sanitizeNumber(formElements.streakTarget.value, 30),
      currentStamps: sanitizeNumber(formElements.streakCurrent.value, 0),
      graceHours: sanitizeNumber(formElements.streakGrace.value, 24),
      streakIconId: formElements.streakIcon.value,
      streakShape: formElements.streakShape.value,
      ...stampStyle
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
  const mainIcon = document.getElementById('preview-main-icon');
  const description = document.getElementById('preview-description');
  const qrImage = document.getElementById('preview-qr');
  const banner = document.getElementById('preview-banner');
  const stampGrid = document.getElementById('preview-stamp-grid');

  subtitle.textContent = payload.subtitle || 'Standard';
  title.textContent = `${getIconSymbol(payload.iconId)} ${payload.title || 'Neue Karte'}`;
  if (payload.customIconUrl) {
    mainIcon.classList.remove('hidden');
    mainIcon.src = payload.customIconUrl;
  } else {
    mainIcon.classList.add('hidden');
    mainIcon.src = '';
  }
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
    banner.style.left = `${payload.banner.positionX ?? 4}%`;
    banner.style.top = `${payload.banner.positionY ?? 4}%`;
    banner.style.width = `${payload.banner.width ?? 60}%`;
    banner.style.height = `${payload.banner.height ?? 42}px`;
    banner.style.backgroundImage = payload.customBannerUrl ? `url(${payload.customBannerUrl})` : 'none';
    banner.style.backgroundSize = 'cover';
    banner.dataset.shape = payload.banner.shape || 'pill';
  } else {
    banner.classList.add('hidden');
    banner.textContent = '';
  }

  stampGrid.innerHTML = '';
  stampGrid.classList.add('hidden');

  const isCoffee = payload.cardProgramType === 'coffee';
  const isStreak = payload.cardProgramType === 'streak';
  if (isCoffee || isStreak) {
    const targetRaw = isCoffee ? payload.programConfig?.stampTarget : payload.programConfig?.targetDays;
    const progressRaw = payload.programConfig?.currentStamps;
    const selectedShape = isCoffee ? payload.programConfig?.stampShape : payload.programConfig?.streakShape;
    const slotIconId = isCoffee ? payload.iconId : payload.programConfig?.streakIconId;
    const slotIconSymbol = getIconSymbol(slotIconId);
    const target = clampNumber(sanitizeNumber(targetRaw, 1), 1, 60);
    const progress = clampNumber(sanitizeNumber(progressRaw, 0), 0, target);

    stampGrid.classList.remove('hidden');
    for (let index = 0; index < target; index += 1) {
      const slot = document.createElement('span');
      slot.className = 'stamp-slot';
      slot.dataset.shape = selectedShape || 'circle';
      slot.classList.toggle('stamp-slot-filled', index < progress);
      slot.textContent = index < progress ? slotIconSymbol : '';
      slot.style.width = `${payload.programConfig?.stampSize ?? 42}px`;
      slot.style.height = `${payload.programConfig?.stampSize ?? 42}px`;
      slot.style.borderColor = payload.programConfig?.stampBorderColor || 'rgba(255,255,255,0.6)';
      slot.style.borderWidth = `${payload.programConfig?.stampBorderWidth ?? 2}px`;
      slot.style.transform = `translate(${payload.programConfig?.stampOffsetX ?? 0}px, ${payload.programConfig?.stampOffsetY ?? 0}px)`;
      stampGrid.appendChild(slot);
    }
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
      textColor: formElements.bannerFg.value,
      shape: formElements.bannerShape.value,
      width: sanitizeNumber(formElements.bannerWidth.value, 60),
      height: sanitizeNumber(formElements.bannerHeight.value, 42),
      positionX: sanitizeNumber(formElements.bannerX.value, 4),
      positionY: sanitizeNumber(formElements.bannerY.value, 4)
    },
    cardProgramType: template.programType || 'generic',
    programConfig: getProgramConfig(template.programType || 'generic'),
    pushEnabled: formElements.pushEnabled.checked,
    notificationRules: getNotificationRules()
  };
}

export function setAuthenticatedView(email) {
  ui.authState.textContent = email;
  animateCardOut(ui.authCard);
  ui.tabbar.classList.remove('hidden');
  ui.logoutBtn.classList.remove('hidden');
  animateCardIn(ui.editorCard);
  animateCardIn(ui.savedCard);
  animateCardIn(ui.statsCard);
}

export function setLoggedOutView() {
  ui.authState.textContent = '';
  animateCardIn(ui.authCard);
  ui.tabbar.classList.add('hidden');
  ui.logoutBtn.classList.add('hidden');
  animateCardOut(ui.editorCard);
  animateCardOut(ui.savedCard);
  animateCardOut(ui.statsCard);
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
  formElements.bannerShape.value = entry.banner_shape || 'pill';
  formElements.bannerWidth.value = entry.banner_width ?? 60;
  formElements.bannerHeight.value = entry.banner_height ?? 42;
  formElements.bannerX.value = entry.banner_position_x ?? 4;
  formElements.bannerY.value = entry.banner_position_y ?? 4;
  syncBannerFields();

  const programConfig = entry.program_config || {};
  formElements.coffeeTarget.value = programConfig.stampTarget ?? 10;
  formElements.coffeeCurrent.value = programConfig.currentStamps ?? 0;
  formElements.coffeeReward.value = programConfig.rewardText ?? '';
  formElements.coffeeShape.value = programConfig.stampShape || 'circle';
  formElements.streakAction.value = programConfig.actionDefinition ?? '';
  formElements.streakTarget.value = programConfig.targetDays ?? 30;
  formElements.streakCurrent.value = programConfig.currentStamps ?? 0;
  formElements.streakGrace.value = programConfig.graceHours ?? 24;
  formElements.streakIcon.value = programConfig.streakIconId || streakIcons[0].id;
  formElements.streakShape.value = programConfig.streakShape || 'circle';
  formElements.stampBorderColor.value = programConfig.stampBorderColor || '#ffffff';
  formElements.stampSize.value = programConfig.stampSize ?? 42;
  formElements.stampBorderWidth.value = programConfig.stampBorderWidth ?? 2;
  formElements.stampOffsetX.value = programConfig.stampOffsetX ?? 0;
  formElements.stampOffsetY.value = programConfig.stampOffsetY ?? 0;
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
        <button type="button" class="btn btn-secondary scan-pass-btn">Karte scannen</button>
        <a class="btn btn-secondary" href="https://api.qrserver.com/v1/create-qr-code/?size=420x420&data=${encodeURIComponent(
          entry.qr_content
        )}" target="_blank" rel="noreferrer">QR öffnen</a>
      </div>
    `;
    ui.passList.appendChild(li);
  }
}

export function renderStats(entries) {
  ui.statsList.innerHTML = '';
  if (!entries.length) {
    const empty = document.createElement('li');
    empty.textContent = 'Noch keine abgeschlossenen Karten vorhanden.';
    ui.statsList.appendChild(empty);
    return;
  }

  const grouped = entries.reduce((acc, row) => {
    const key = row.pass_title || 'Unbenannte Karte';
    if (!acc[key]) {
      acc[key] = { pass_title: key, completed_count: 0, last_completed_at: row.completed_at };
    }
    acc[key].completed_count += 1;
    if (new Date(row.completed_at) > new Date(acc[key].last_completed_at)) {
      acc[key].last_completed_at = row.completed_at;
    }
    return acc;
  }, {});

  for (const entry of Object.values(grouped)) {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <strong>${entry.pass_title}</strong>
        <p class="muted small">Abschlüsse: ${entry.completed_count}</p>
        <p class="muted small">Zuletzt: ${new Date(entry.last_completed_at).toLocaleString('de-DE')}</p>
      </div>
    `;
    ui.statsList.appendChild(li);
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

export function onSavedPassScan(handler) {
  ui.passList.addEventListener('click', (event) => {
    const button = event.target.closest('.scan-pass-btn');
    if (!button) return;
    const row = button.closest('li[data-pass-id]');
    if (!row) return;
    handler(row.dataset.passId);
  });
}

export function setActiveTab(tabName) {
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.tab === tabName));
  ui.editorCard.classList.toggle('hidden', tabName !== 'editor');
  ui.savedCard.classList.toggle('hidden', tabName !== 'saved');
  ui.statsCard.classList.toggle('hidden', tabName !== 'stats');
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
