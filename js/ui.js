import { backgroundTemplates, bannerColorOptions, passTemplates, streakIcons, templateIcons } from './config.js';
import {
  getDefaultPasskitConfig,
  normalizePasskitConfig,
  passkitBarcodeFormats,
  passkitPassTypes
} from './passkit.js';

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
  confirmOkBtn: document.getElementById('confirm-ok-btn'),
  openWalletSimBtn: document.getElementById('open-wallet-sim-btn'),
  walletSimModal: document.getElementById('wallet-sim-modal'),
  walletSimCloseBtn: document.getElementById('wallet-sim-close-btn'),
  walletSimStack: document.getElementById('wallet-sim-stack'),
  walletSimDetail: document.getElementById('wallet-sim-detail'),
  savedFolderNameInput: document.getElementById('saved-folder-name'),
  createFolderBtn: document.getElementById('create-folder-btn'),
  savedFilterToggleBtn: document.getElementById('saved-filter-toggle-btn'),
  savedFolderToggleBtn: document.getElementById('saved-folder-toggle-btn'),
  savedFiltersPanel: document.getElementById('saved-filters-panel'),
  savedFolderPanel: document.getElementById('saved-folder-panel'),
  savedFolderFilter: document.getElementById('saved-folder-filter'),
  savedTypeFilter: document.getElementById('saved-type-filter'),
  savedSort: document.getElementById('saved-sort')
};

export const formElements = {
  email: document.getElementById('email'),
  password: document.getElementById('password'),
  title: document.getElementById('pass-title'),
  subtitle: document.getElementById('pass-subtitle'),
  description: document.getElementById('pass-description'),
  qrContent: document.getElementById('pass-qr-content'),
  businessName: document.getElementById('business-name'),
  businessCategory: document.getElementById('business-category'),
  folder: document.getElementById('pass-folder'),
  template: document.getElementById('pass-template'),
  icon: document.getElementById('pass-icon'),
  iconUpload: document.getElementById('pass-icon-upload'),
  streakIcon: document.getElementById('streak-icon'),
  bg: document.getElementById('pass-bg'),
  fg: document.getElementById('pass-fg'),
  walletSkin: document.getElementById('pass-wallet-skin'),
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
  creditThreshold: document.getElementById('credit-threshold'),
  stampFrameSection: document.getElementById('stamp-frame-section'),
  passkitEnabled: document.getElementById('passkit-enabled'),
  passkitPassType: document.getElementById('passkit-pass-type'),
  passkitPassTypeIdentifier: document.getElementById('passkit-pass-type-identifier'),
  passkitTeamIdentifier: document.getElementById('passkit-team-identifier'),
  passkitOrganizationName: document.getElementById('passkit-organization-name'),
  passkitSerialNumber: document.getElementById('passkit-serial-number'),
  passkitDescription: document.getElementById('passkit-description'),
  passkitForegroundColor: document.getElementById('passkit-foreground-color'),
  passkitBackgroundColor: document.getElementById('passkit-background-color'),
  passkitLabelColor: document.getElementById('passkit-label-color'),
  passkitRelevantDate: document.getElementById('passkit-relevant-date'),
  passkitLatitude: document.getElementById('passkit-latitude'),
  passkitLongitude: document.getElementById('passkit-longitude'),
  passkitBarcodeFormat: document.getElementById('passkit-barcode-format'),
  passkitMessageEncoding: document.getElementById('passkit-message-encoding')
};

let pendingConfirmResolver = null;
let selectedSimulationPassId = null;
let simulationPasses = [];
const cardTransitionDurationMs = 260;
const transitionTimers = new WeakMap();
const weekdays = [
  { value: 'monday', label: 'Montag' },
  { value: 'tuesday', label: 'Dienstag' },
  { value: 'wednesday', label: 'Mittwoch' },
  { value: 'thursday', label: 'Donnerstag' },
  { value: 'friday', label: 'Freitag' },
  { value: 'saturday', label: 'Samstag' },
  { value: 'sunday', label: 'Sonntag' }
];

const defaultPreviewLogo =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='8' fill='%23ffffff'/%3E%3Ctext x='20' y='24' text-anchor='middle' font-size='12' font-family='Arial' fill='%23111111'%3EEV%3C/text%3E%3C/svg%3E";

const stampIconDefinitions = {
  'coffee-cup': { name: 'coffee', path: 'M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z M6 2v2M10 2v2M14 2v2' },
  cocktail: { name: 'martini', path: 'M5 5h14l-7 8v6l4 2M12 19l-4 2' },
  sandwich: { name: 'sandwich', path: 'M4 9a8 8 0 0 1 16 0v1H4Zm1 1v5a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-5' },
  'menu-card': { name: 'clipboard', path: 'M9 4h6a2 2 0 0 1 2 2v14H7V6a2 2 0 0 1 2-2Zm0 0a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2M9 11h6M9 15h4' },
  cake: { name: 'cake', path: 'M4 11h16v9H4Zm4-5a2 2 0 0 1 4 0v5H8Zm6 0a2 2 0 1 1 4 0v5h-4' },
  pizza: { name: 'pizza', path: 'm3 4 18 8-8 8Zm6 4 4 4M7 13l2 2M12 10l2 2' },
  burger: { name: 'burger', path: 'M4 11h16M4 14h16M6 19h12a2 2 0 0 0 2-2v-3H4v3a2 2 0 0 0 2 2Zm1-8a5 5 0 0 1 10 0' },
  'soccer-ball': { name: 'soccer', path: 'M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 4 3 2-1 3h-4L9 8Zm-4 7 2-1 2 1 2-1 2 1-1 3-3 2-3-2Z' },
  hockey: { name: 'hockey', path: 'm5 5 7 7M8 2l5 5M15 14l4 4-2 2-4-4Z M3 20h8' },
  gift: { name: 'gift', path: 'M20 7H4v13h16ZM2 7h20v4H2Zm10 0v13M12 7H8a2 2 0 1 1 0-4c2 0 4 4 4 4Zm0 0h4a2 2 0 1 0 0-4c-2 0-4 4-4 4Z' },
  running: { name: 'running', path: 'M13 5a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm-1 6 3 2 2 4M11 11l-2 3H6m5-3 4-2 3 1' },
  flame: { name: 'flame', path: 'M12 2c3 3 4 5 4 8a4 4 0 0 1-8 0c0-2 1-4 4-8Zm0 7c2 2 3 3 3 5a3 3 0 1 1-6 0c0-1 1-3 3-5Z' }
};

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

function createStampIcon(iconId, isFilled, customIconUrl = '') {
  if (customIconUrl) {
    const uploadedIcon = document.createElement('img');
    uploadedIcon.className = 'stamp-slot-uploaded-icon';
    uploadedIcon.src = customIconUrl;
    uploadedIcon.alt = 'Eigenes Stempel-Icon';
    return uploadedIcon;
  }

  const iconDefinition = stampIconDefinitions[iconId];
  if (!iconDefinition) {
    const fallback = document.createElement('span');
    fallback.className = 'stamp-slot-fallback-icon';
    fallback.textContent = getIconSymbol(iconId);
    return fallback;
  }

  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('class', 'stamp-slot-icon');
  icon.setAttribute('aria-label', iconDefinition.name);

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', iconDefinition.path);
  path.setAttribute('fill', isFilled ? 'currentColor' : 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.9');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');

  icon.appendChild(path);
  return icon;
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

  formElements.passkitPassType.innerHTML = '';
  for (const type of passkitPassTypes) {
    const option = document.createElement('option');
    option.value = type.id;
    option.textContent = type.name;
    formElements.passkitPassType.appendChild(option);
  }

  formElements.passkitBarcodeFormat.innerHTML = '';
  for (const format of passkitBarcodeFormats) {
    const option = document.createElement('option');
    option.value = format.id;
    option.textContent = format.name;
    formElements.passkitBarcodeFormat.appendChild(option);
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
  const hasStampBackground = programType === 'coffee' || programType === 'streak';
  formElements.stampFrameSection.classList.toggle('hidden', !hasStampBackground);
}

export function initSectionDropdowns() {
  const sections = document.querySelectorAll('.config-section');
  sections.forEach((section, index) => {
    if (section.dataset.dropdownReady === 'true') {
      return;
    }

    const title = section.querySelector('h3');
    if (!title) {
      return;
    }

    const content = document.createElement('div');
    content.className = 'section-content';
    const childElements = Array.from(section.children).filter((element) => element !== title);
    childElements.forEach((element) => content.appendChild(element));
    section.appendChild(content);

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'section-toggle';
    trigger.innerHTML = `
      <span>${title.textContent}</span>
      <span class="section-toggle-icon" aria-hidden="true">▾</span>
    `;
    title.replaceWith(trigger);

    const isOpenByDefault = index === 0;
    section.classList.toggle('is-collapsed', !isOpenByDefault);
    trigger.setAttribute('aria-expanded', String(isOpenByDefault));

    trigger.addEventListener('click', () => {
      const isCollapsed = section.classList.toggle('is-collapsed');
      trigger.setAttribute('aria-expanded', String(!isCollapsed));
    });

    section.dataset.dropdownReady = 'true';
  });
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
  const scheduleType = rule.scheduleType || 'exact';
  const recurringDay = rule.recurringDay || 'monday';
  const recurringTime = rule.recurringTime || '';

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
    <div class="rule-schedule-fields">
      <label>
        Zeitplan
        <select class="rule-schedule-type">
          <option value="exact" ${scheduleType === 'exact' ? 'selected' : ''}>Genaues Datum & Uhrzeit</option>
          <option value="recurring" ${scheduleType === 'recurring' ? 'selected' : ''}>Wiederkehrend (Wochentag + Uhrzeit)</option>
        </select>
      </label>
      <div class="rule-exact-fields">
        <label>
          Zeitpunkt
          <input class="rule-datetime" type="datetime-local" value="${rule.sendAt || ''}" />
        </label>
      </div>
      <div class="rule-recurring-fields hidden">
        <label>
          Wochentag
          <select class="rule-recurring-day">
            ${weekdays
              .map(
                (day) =>
                  `<option value="${day.value}" ${recurringDay === day.value ? 'selected' : ''}>${day.label}</option>`
              )
              .join('')}
          </select>
        </label>
        <label>
          Uhrzeit
          <input class="rule-recurring-time" type="time" value="${recurringTime}" />
        </label>
      </div>
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
      <label>
        Optionaler Zeitpunkt
        <input class="rule-location-datetime" type="datetime-local" value="${rule.sendAt || ''}" />
      </label>
      <button type="button" class="btn btn-secondary rule-location-btn">Aktuellen Standort nutzen</button>
    </div>
    <button type="button" class="btn btn-danger rule-remove">Regel entfernen</button>
  `;

  const triggerSelect = row.querySelector('.rule-trigger');
  const locationFields = row.querySelector('.rule-location-fields');
  const scheduleTypeSelect = row.querySelector('.rule-schedule-type');
  const exactFields = row.querySelector('.rule-exact-fields');
  const recurringFields = row.querySelector('.rule-recurring-fields');

  const syncTriggerState = () => {
    const isLocation = triggerSelect.value === 'location';
    locationFields.classList.toggle('hidden', !isLocation);
  };

  const syncScheduleState = () => {
    const isRecurring = scheduleTypeSelect.value === 'recurring';
    recurringFields.classList.toggle('hidden', !isRecurring);
    exactFields.classList.toggle('hidden', isRecurring);
  };

  triggerSelect.addEventListener('change', syncTriggerState);
  scheduleTypeSelect.addEventListener('change', syncScheduleState);
  syncTriggerState();
  syncScheduleState();

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
        message: row.querySelector('.rule-message').value.trim(),
        scheduleType: row.querySelector('.rule-schedule-type').value
      };

      const scheduleType = base.scheduleType;
      const scheduleData =
        scheduleType === 'exact'
          ? {
              sendAt: row.querySelector('.rule-datetime').value || null,
              recurringDay: null,
              recurringTime: null
            }
          : {
              sendAt: null,
              recurringDay: row.querySelector('.rule-recurring-day').value || null,
              recurringTime: row.querySelector('.rule-recurring-time').value || null
            };

      if (triggerType === 'time') {
        return {
          ...base,
          ...scheduleData
        };
      }

      return {
        ...base,
        ...scheduleData,
        latitude: sanitizeNumber(row.querySelector('.rule-lat').value, 0),
        longitude: sanitizeNumber(row.querySelector('.rule-lng').value, 0),
        radiusMeters: sanitizeNumber(row.querySelector('.rule-radius').value, 250),
        sendAt: row.querySelector('.rule-location-datetime').value || null
      };
    })
    .filter((rule) => {
      if (!rule.name || !rule.message) {
        return false;
      }

      if (rule.scheduleType === 'exact') {
        return Boolean(rule.sendAt);
      }

      return Boolean(rule.recurringDay && rule.recurringTime);
    });
}

export function updatePreview(payload) {
  const preview = document.getElementById('pass-preview');
  const company = document.getElementById('preview-company');
  const cardType = document.getElementById('preview-card-type');
  const name = document.getElementById('preview-name');
  const status = document.getElementById('preview-status');
  const points = document.getElementById('preview-points');
  const customerNumber = document.getElementById('preview-customer-number');
  const validUntil = document.getElementById('preview-valid-until');
  const mainIcon = document.getElementById('preview-main-icon');
  const qrImage = document.getElementById('preview-qr');
  const qrCodeText = document.getElementById('preview-qr-code-text');
  const walletLabel = document.getElementById('preview-wallet-label');

  const walletSkin = payload.walletSkin || 'apple';
  const walletLabels = {
    apple: 'Apple Wallet',
    google: 'Google Wallet',
    samsung: 'Samsung Wallet'
  };

  preview.dataset.walletSkin = walletSkin;
  if (walletLabel) {
    walletLabel.textContent = walletLabels[walletSkin] || walletLabels.apple;
  }

  company.textContent = payload.businessName || 'Egli+Vitali AG';
  cardType.textContent = payload.subtitle || 'Kundenkarte';
  name.textContent = payload.title || 'Max Muster';
  status.textContent = payload.cardProgramType === 'streak' ? 'Streak' : payload.cardProgramType === 'coffee' ? 'Treuekarte' : 'Aktiv';

  const pointValue =
    payload.cardProgramType === 'credit'
      ? Math.round(sanitizeNumber(payload.programConfig?.creditBalance, 0))
      : Math.round(sanitizeNumber(payload.programConfig?.currentStamps, 0));
  points.textContent = String(pointValue);

  const customerNumberValue =
    payload.passkit?.serialNumber ||
    payload.passkitSerialNumber ||
    payload.qrContent ||
    'EV-000123';
  customerNumber.textContent = customerNumberValue;
  qrCodeText.textContent = customerNumberValue;

  const relevantDate = payload.passkit?.relevantDate || payload.passkitRelevantDate || '';
  if (relevantDate) {
    const parsedDate = new Date(relevantDate);
    validUntil.textContent = Number.isNaN(parsedDate.getTime()) ? relevantDate : parsedDate.toLocaleDateString('de-CH');
  } else {
    validUntil.textContent = '31.12.2026';
  }

  if (payload.customIconUrl) {
    mainIcon.classList.remove('hidden');
    mainIcon.src = payload.customIconUrl;
  } else {
    mainIcon.classList.remove('hidden');
    mainIcon.src = defaultPreviewLogo;
  }
  preview.style.color = payload.foregroundColor || '#ffffff';

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    payload.qrContent || 'https://example.com'
  )}`;
  qrImage.src = qrUrl;
}

function toWalletSimulationEntry(rawEntry, fallbackId = null) {
  const title = rawEntry.title || 'Neue Karte';
  const subtitle = rawEntry.subtitle || rawEntry.business_name || rawEntry.businessName || 'Wallet Pass';
  const qrContent = rawEntry.qrContent || rawEntry.qr_content || 'https://example.com';
  const iconId = rawEntry.iconId || rawEntry.icon_id || 'gift';
  const entryId = rawEntry.id || fallbackId || `sim-${Math.random().toString(36).slice(2, 10)}`;
  const cardProgramType = rawEntry.cardProgramType || rawEntry.card_program_type || 'generic';
  const programConfig = rawEntry.programConfig || rawEntry.program_config || {};
  const targetRaw = cardProgramType === 'coffee' ? programConfig.stampTarget : programConfig.targetDays;
  const currentRaw = programConfig.currentStamps;
  const stampTarget = clampNumber(sanitizeNumber(targetRaw, 10), 1, 60);
  const currentStamps = clampNumber(sanitizeNumber(currentRaw, 0), 0, stampTarget);

  return {
    id: entryId,
    title,
    subtitle,
    qrContent,
    iconId,
    cardProgramType,
    stampTarget,
    currentStamps,
    backgroundColor: rawEntry.backgroundColor || rawEntry.background_color || '#1d1d1f',
    foregroundColor: rawEntry.foregroundColor || rawEntry.foreground_color || '#ffffff',
    customImageUrl: rawEntry.customImageUrl || rawEntry.custom_image_url || '',
    backgroundTemplateId: rawEntry.backgroundTemplateId || rawEntry.background_template_id || 'custom'
  };
}

function getSimulationBackground(entry) {
  if (entry.customImageUrl) {
    return `url(${entry.customImageUrl})`;
  }

  const selectedBgTemplate = backgroundTemplates.find((template) => template.id === entry.backgroundTemplateId);
  if (selectedBgTemplate) {
    return selectedBgTemplate.gradient;
  }

  return entry.backgroundColor;
}

function renderWalletSimulationDetail(entry) {
  if (!ui.walletSimDetail) {
    return;
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(entry.qrContent)}`;
  const issuer = entry.subtitle || 'Wallet Pass';
  const hasStampProgram = entry.cardProgramType === 'coffee' || entry.cardProgramType === 'streak';
  const progressText = hasStampProgram ? `${entry.currentStamps} von ${entry.stampTarget}` : null;
  const stampPreview = hasStampProgram
    ? `<div class="wallet-sim-detail-stamp-hero">
        <span class="wallet-sim-detail-stamp-icon">${getIconSymbol(entry.iconId)}</span>
        <p class="wallet-sim-detail-stamp-label">Stempel</p>
        <p class="wallet-sim-detail-stamp-progress">${progressText}</p>
      </div>`
    : '';
  const isLivePreview = entry.id === 'live-preview';

  ui.walletSimDetail.innerHTML = `
    <div class="wallet-sim-detail-pass" style="background:${getSimulationBackground(entry)}; color:${entry.foregroundColor};">
      <div class="wallet-sim-detail-header">
        <p class="wallet-sim-detail-issuer">${issuer}</p>
        <span class="wallet-sim-detail-chip">${isLivePreview ? 'Live' : 'Gespeichert'}</span>
      </div>
      <p class="wallet-sim-detail-subtitle">${entry.subtitle}</p>
      <h4 class="wallet-sim-detail-title">${getIconSymbol(entry.iconId)} ${entry.title}</h4>
      ${stampPreview}
      <img class="wallet-sim-detail-qr" src="${qrUrl}" alt="QR Code von ${entry.title}" />
    </div>
  `;
}

function renderWalletSimulationStack() {
  if (!ui.walletSimStack) {
    return;
  }

  ui.walletSimStack.innerHTML = '';

  simulationPasses.forEach((entry, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'wallet-sim-mini-pass';
    button.dataset.simPassId = entry.id;
    button.style.setProperty('--stack-order', String(index));
    button.setAttribute('aria-label', `Karte ${entry.title} öffnen`);
    button.style.background = getSimulationBackground(entry);
    button.style.color = entry.foregroundColor;
    button.style.zIndex = String(simulationPasses.length - index);
    button.classList.toggle('is-active', entry.id === selectedSimulationPassId);
    const hasStampProgram = entry.cardProgramType === 'coffee' || entry.cardProgramType === 'streak';
    const progressText = hasStampProgram ? `Stempel ${entry.currentStamps} von ${entry.stampTarget}` : '';
    button.innerHTML = `
      <div class="wallet-sim-mini-leading">
        <span class="wallet-sim-mini-icon">${getIconSymbol(entry.iconId)}</span>
        <div class="wallet-sim-mini-copy">
          <p class="wallet-sim-mini-subtitle">${entry.subtitle}</p>
          <p class="wallet-sim-mini-title">${entry.title}</p>
        </div>
      </div>
      ${hasStampProgram ? `<p class="wallet-sim-mini-progress">${progressText}</p>` : ''}
    `;
    ui.walletSimStack.appendChild(button);
  });
}

export function renderWalletSimulation({ currentPass, savedPasses = [] }) {
  const normalizedCurrent = toWalletSimulationEntry(currentPass, 'live-preview');
  const normalizedSaved = savedPasses.map((entry) => toWalletSimulationEntry(entry));
  simulationPasses = [normalizedCurrent, ...normalizedSaved].slice(0, 8);
  selectedSimulationPassId = simulationPasses[0]?.id || null;

  renderWalletSimulationStack();
  if (simulationPasses[0]) {
    renderWalletSimulationDetail(simulationPasses[0]);
  } else if (ui.walletSimDetail) {
    ui.walletSimDetail.innerHTML = '<p class="muted small">Keine Karten für die Simulation verfügbar.</p>';
  }
}

export function openWalletSimulation() {
  if (!ui.walletSimModal) {
    return;
  }
  ui.walletSimModal.classList.remove('hidden');
}

export function closeWalletSimulation() {
  if (!ui.walletSimModal) {
    return;
  }
  ui.walletSimModal.classList.add('hidden');
}

export function getPassFormData() {
  const template = getTemplateById(formElements.template.value);
  const passkitConfig = normalizePasskitConfig({
    enabled: formElements.passkitEnabled.checked,
    passType: formElements.passkitPassType.value,
    passTypeIdentifier: formElements.passkitPassTypeIdentifier.value,
    teamIdentifier: formElements.passkitTeamIdentifier.value,
    organizationName: formElements.passkitOrganizationName.value,
    serialNumber: formElements.passkitSerialNumber.value,
    description: formElements.passkitDescription.value,
    foregroundColor: formElements.passkitForegroundColor.value,
    backgroundColor: formElements.passkitBackgroundColor.value,
    labelColor: formElements.passkitLabelColor.value,
    relevantDate: formElements.passkitRelevantDate.value,
    location: {
      latitude: formElements.passkitLatitude.value,
      longitude: formElements.passkitLongitude.value
    },
    barcode: {
      format: formElements.passkitBarcodeFormat.value,
      messageEncoding: formElements.passkitMessageEncoding.value
    }
  });

  return {
    title: formElements.title.value.trim(),
    subtitle: formElements.subtitle.value.trim(),
    description: formElements.description.value.trim(),
    qrContent: formElements.qrContent.value.trim(),
    businessName: formElements.businessName.value.trim(),
    businessCategory: formElements.businessCategory.value,
    folderName: formElements.folder.value || 'none',
    templateId: formElements.template.value,
    iconId: formElements.icon.value,
    walletSkin: formElements.walletSkin.value,
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
    notificationRules: getNotificationRules(),
    passkitConfig
  };
}

export function renderEditorFolderOptions(folderNames = [], selectedFolder = 'none') {
  if (!formElements.folder) return;
  const availableFolders = ['none', ...folderNames];
  const labels = {
    none: 'Kein Ordner'
  };

  formElements.folder.innerHTML = '';
  for (const folderName of availableFolders) {
    const option = document.createElement('option');
    option.value = folderName;
    option.textContent = labels[folderName] || folderName;
    formElements.folder.appendChild(option);
  }

  formElements.folder.value = availableFolders.includes(selectedFolder) ? selectedFolder : 'none';
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
  const passkitConfig = normalizePasskitConfig(entry.passkit_config || getDefaultPasskitConfig());
  formElements.title.value = entry.title || '';
  formElements.subtitle.value = entry.subtitle || '';
  formElements.description.value = entry.description || '';
  formElements.qrContent.value = entry.qr_content || '';
  formElements.businessName.value = entry.business_name || '';
  formElements.businessCategory.value = entry.business_category || 'restaurant';
  formElements.template.value = entry.template_id || passTemplates[0].id;
  formElements.icon.value = entry.icon_id || templateIcons[0].id;
  formElements.walletSkin.value = entry.wallet_skin || 'apple';
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

  formElements.passkitEnabled.checked = Boolean(passkitConfig.enabled);
  formElements.passkitPassType.value = passkitConfig.passType;
  formElements.passkitPassTypeIdentifier.value = passkitConfig.passTypeIdentifier;
  formElements.passkitTeamIdentifier.value = passkitConfig.teamIdentifier;
  formElements.passkitOrganizationName.value = passkitConfig.organizationName;
  formElements.passkitSerialNumber.value = passkitConfig.serialNumber;
  formElements.passkitDescription.value = passkitConfig.description;
  formElements.passkitForegroundColor.value = passkitConfig.foregroundColor;
  formElements.passkitBackgroundColor.value = passkitConfig.backgroundColor;
  formElements.passkitLabelColor.value = passkitConfig.labelColor;
  formElements.passkitRelevantDate.value = passkitConfig.relevantDate;
  formElements.passkitLatitude.value = passkitConfig.location.latitude ?? '';
  formElements.passkitLongitude.value = passkitConfig.location.longitude ?? '';
  formElements.passkitBarcodeFormat.value = passkitConfig.barcode.format;
  formElements.passkitMessageEncoding.value = passkitConfig.barcode.messageEncoding;

  renderProgramFields(entry.card_program_type || 'generic');
  setNotificationRules(entry.notification_rules || []);
}

function getCardKind(entry) {
  return entry.template_id || 'unknown';
}

function getCardKindLabel(kind) {
  if (kind === 'unknown') return 'Unbekannte Kartenart';
  const template = passTemplates.find((entry) => entry.id === kind);
  return template?.name || kind;
}

function sortSavedEntries(entries, sortMode) {
  const sorted = [...entries];
  sorted.sort((a, b) => {
    if (sortMode === 'oldest') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    if (sortMode === 'title-asc') {
      return (a.title || '').localeCompare(b.title || '', 'de-DE', { sensitivity: 'base' });
    }
    if (sortMode === 'title-desc') {
      return (b.title || '').localeCompare(a.title || '', 'de-DE', { sensitivity: 'base' });
    }
    if (sortMode === 'type') {
      const left = getCardKindLabel(getCardKind(a));
      const right = getCardKindLabel(getCardKind(b));
      const typeComparison = left.localeCompare(right, 'de-DE', { sensitivity: 'base' });
      if (typeComparison !== 0) return typeComparison;
      return (a.title || '').localeCompare(b.title || '', 'de-DE', { sensitivity: 'base' });
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  return sorted;
}

function renderFolderFilterOptions(folderNames, selectedFolder) {
  if (!ui.savedFolderFilter) return;
  const options = ['all', 'none', ...folderNames];
  const labels = {
    all: 'Alle Ordner',
    none: 'Ohne Ordner'
  };

  ui.savedFolderFilter.innerHTML = '';
  for (const folderId of options) {
    const option = document.createElement('option');
    option.value = folderId;
    option.textContent = labels[folderId] || folderId;
    ui.savedFolderFilter.appendChild(option);
  }
  ui.savedFolderFilter.value = options.includes(selectedFolder) ? selectedFolder : 'all';
}

function renderTypeFilterOptions(entries, selectedType) {
  if (!ui.savedTypeFilter) return 'all';

  const templateIdsFromConfig = passTemplates.map((template) => template.id);
  const templateIdsFromEntries = entries.map((entry) => getCardKind(entry)).filter((value) => value !== 'unknown');
  const templateIds = Array.from(new Set([...templateIdsFromConfig, ...templateIdsFromEntries]));

  ui.savedTypeFilter.innerHTML = '';

  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'Alle Kartenarten';
  ui.savedTypeFilter.appendChild(allOption);

  for (const templateId of templateIds) {
    const option = document.createElement('option');
    option.value = templateId;
    option.textContent = getCardKindLabel(templateId);
    ui.savedTypeFilter.appendChild(option);
  }

  const safeValue = templateIds.includes(selectedType) ? selectedType : 'all';
  ui.savedTypeFilter.value = safeValue;
  return safeValue;
}

export function renderSavedPasses(entries, options = {}) {
  const folderAssignments = options.folderAssignments || {};
  const folderNames = options.folderNames || [];
  const filters = {
    folder: options.filters?.folder || 'all',
    cardType: options.filters?.cardType || 'all',
    sort: options.filters?.sort || 'newest'
  };

  renderFolderFilterOptions(folderNames, filters.folder);

  filters.cardType = renderTypeFilterOptions(entries, filters.cardType);
  if (ui.savedSort) {
    ui.savedSort.value = filters.sort;
  }

  ui.passList.innerHTML = '';
  if (!entries.length) {
    const empty = document.createElement('li');
    empty.textContent = 'Noch keine Karten gespeichert.';
    ui.passList.appendChild(empty);
    return;
  }

  const filteredEntries = entries.filter((entry) => {
    const assignedFolder = folderAssignments[entry.id] || 'none';
    const folderMatches = filters.folder === 'all' || assignedFolder === filters.folder;
    const cardKind = getCardKind(entry);
    const typeMatches = filters.cardType === 'all' || cardKind === filters.cardType;
    return folderMatches && typeMatches;
  });

  const sortedEntries = sortSavedEntries(filteredEntries, filters.sort);

  if (!sortedEntries.length) {
    const empty = document.createElement('li');
    empty.textContent = 'Keine Karten entsprechen dem gewählten Filter.';
    ui.passList.appendChild(empty);
    return;
  }

  for (const entry of sortedEntries) {
    const li = document.createElement('li');
    li.dataset.passId = entry.id;
    const ruleCount = Array.isArray(entry.notification_rules) ? entry.notification_rules.length : 0;
    const currentFolder = folderAssignments[entry.id] || 'none';
    const folderOptionItems = ['none', ...folderNames]
      .map((folderName) => {
        const label = folderName === 'none' ? 'Kein Ordner' : folderName;
        const selected = folderName === currentFolder ? 'selected' : '';
        return `<option value="${folderName}" ${selected}>${label}</option>`;
      })
      .join('');

    const cardKind = getCardKind(entry);

    li.innerHTML = `
      <div>
        <strong>${entry.title}</strong>
        <p class="muted small">${entry.subtitle || 'Kein Untertitel'} · ${new Date(entry.created_at).toLocaleString('de-DE')}</p>
        <p class="muted small">Art: ${getCardKindLabel(cardKind)} · Push-Regeln: ${ruleCount}</p>
        <p class="muted small">Betrieb: ${entry.business_name || 'Nicht angegeben'} · Kategorie: ${entry.business_category || 'n/a'}</p>
        <p class="muted small">Vorlagenpfad: ${entry.template_storage_path || 'wird beim Speichern erzeugt'}</p>
      </div>
      <div class="saved-actions">
        <label class="small muted">
          Ordner
          <select class="saved-pass-folder-select" data-pass-id="${entry.id}">
            ${folderOptionItems}
          </select>
        </label>
        <div class="row-buttons">
          <button type="button" class="btn btn-secondary open-pass-btn">Öffnen</button>
          <button type="button" class="btn btn-secondary scan-pass-btn">Karte scannen</button>
          <a class="btn btn-secondary" href="https://api.qrserver.com/v1/create-qr-code/?size=420x420&data=${encodeURIComponent(
            entry.qr_content
          )}" target="_blank" rel="noreferrer">QR öffnen</a>
        </div>
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

export function onSavedPassFolderChange(handler) {
  ui.passList.addEventListener('change', (event) => {
    const select = event.target.closest('.saved-pass-folder-select');
    if (!select) return;
    handler(select.dataset.passId, select.value);
  });
}

export function onSavedCardFiltersChange(handler) {
  const controls = [ui.savedFolderFilter, ui.savedTypeFilter, ui.savedSort].filter(Boolean);
  controls.forEach((control) => {
    control.addEventListener('change', () => {
      handler({
        folder: ui.savedFolderFilter?.value || 'all',
        cardType: ui.savedTypeFilter?.value || 'all',
        sort: ui.savedSort?.value || 'newest'
      });
    });
  });
}

export function onCreateFolder(handler) {
  if (!ui.createFolderBtn || !ui.savedFolderNameInput) return;

  ui.createFolderBtn.addEventListener('click', () => {
    handler(ui.savedFolderNameInput.value || '');
  });

  ui.savedFolderNameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handler(ui.savedFolderNameInput.value || '');
    }
  });
}

export function onSavedToolbarToggle() {
  const mappings = [
    { button: ui.savedFilterToggleBtn, panel: ui.savedFiltersPanel },
    { button: ui.savedFolderToggleBtn, panel: ui.savedFolderPanel }
  ];

  mappings.forEach(({ button, panel }) => {
    if (!button || !panel) return;
    button.addEventListener('click', () => {
      const isHidden = panel.classList.contains('hidden');
      panel.classList.toggle('hidden', !isHidden);
      button.classList.toggle('is-active', isHidden);
    });
  });
}

export function clearFolderInput() {
  if (ui.savedFolderNameInput) {
    ui.savedFolderNameInput.value = '';
  }
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

ui.walletSimCloseBtn?.addEventListener('click', closeWalletSimulation);
ui.walletSimModal?.addEventListener('click', (event) => {
  if (event.target === ui.walletSimModal) {
    closeWalletSimulation();
  }
});
ui.walletSimStack?.addEventListener('click', (event) => {
  const cardButton = event.target.closest('.wallet-sim-mini-pass');
  if (!cardButton) return;

  selectedSimulationPassId = cardButton.dataset.simPassId;
  const selectedEntry = simulationPasses.find((entry) => entry.id === selectedSimulationPassId);
  renderWalletSimulationStack();
  if (selectedEntry) {
    renderWalletSimulationDetail(selectedEntry);
  }
});

export function showToast(message, isError = false) {
  ui.toast.textContent = message;
  ui.toast.style.background = isError ? '#b42318' : '#111';
  ui.toast.classList.remove('hidden');
  setTimeout(() => ui.toast.classList.add('hidden'), 3200);
}
