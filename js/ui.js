import { passTemplates } from './config.js';

export const ui = {
  authState: document.getElementById('auth-state'),
  logoutBtn: document.getElementById('logout-btn'),
  authCard: document.getElementById('auth-card'),
  editorCard: document.getElementById('editor-card'),
  savedCard: document.getElementById('saved-card'),
  toast: document.getElementById('toast'),
  passList: document.getElementById('saved-pass-list'),
  notificationRules: document.getElementById('notification-rules')
};

export const formElements = {
  email: document.getElementById('email'),
  password: document.getElementById('password'),
  title: document.getElementById('pass-title'),
  subtitle: document.getElementById('pass-subtitle'),
  description: document.getElementById('pass-description'),
  qrContent: document.getElementById('pass-qr-content'),
  template: document.getElementById('pass-template'),
  bg: document.getElementById('pass-bg'),
  fg: document.getElementById('pass-fg'),
  upload: document.getElementById('pass-upload'),
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

export function initTemplateSelect() {
  formElements.template.innerHTML = '';
  for (const template of passTemplates) {
    const option = document.createElement('option');
    option.value = template.id;
    option.textContent = template.name;
    formElements.template.appendChild(option);
  }

  formElements.template.value = passTemplates[0].id;
}

export function getTemplateById(id) {
  return passTemplates.find((template) => template.id === id) || passTemplates[0];
}

export function renderProgramFields(programType) {
  document.querySelectorAll('.program-panel').forEach((panel) => panel.classList.add('hidden'));
  const panel = document.getElementById(`program-${programType}`) || document.getElementById('program-generic');
  panel.classList.remove('hidden');
}

function sanitizeNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function applyTemplateDefaults(template) {
  if (!template.defaults) return;

  if (template.programType === 'coffee') {
    formElements.coffeeTarget.value = template.defaults.stampTarget;
    formElements.coffeeCurrent.value = template.defaults.currentStamps;
    formElements.coffeeReward.value = template.defaults.rewardText;
  }

  if (template.programType === 'streak') {
    formElements.streakAction.value = template.defaults.actionDefinition;
    formElements.streakTarget.value = template.defaults.targetDays;
    formElements.streakGrace.value = template.defaults.graceHours;
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
      graceHours: sanitizeNumber(formElements.streakGrace.value, 24)
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

  subtitle.textContent = payload.subtitle || 'Standard';
  title.textContent = payload.title || 'Neue Karte';
  description.textContent = payload.description || '';

  if (payload.customImageUrl) {
    preview.style.backgroundImage = `url(${payload.customImageUrl})`;
    preview.style.backgroundSize = 'cover';
    preview.style.backgroundPosition = 'center';
  } else {
    preview.style.backgroundImage = payload.templateGradient;
  }

  preview.style.color = payload.foregroundColor;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    payload.qrContent || 'https://example.com'
  )}`;
  qrImage.src = qrUrl;
}

export function getPassFormData() {
  const template = getTemplateById(formElements.template.value);
  return {
    title: formElements.title.value.trim(),
    subtitle: formElements.subtitle.value.trim(),
    description: formElements.description.value.trim(),
    qrContent: formElements.qrContent.value.trim(),
    templateId: formElements.template.value,
    backgroundColor: formElements.bg.value,
    foregroundColor: formElements.fg.value,
    cardProgramType: template.programType || 'generic',
    programConfig: getProgramConfig(template.programType || 'generic'),
    pushEnabled: formElements.pushEnabled.checked,
    notificationRules: getNotificationRules()
  };
}

export function setTemplateColors(template) {
  formElements.bg.value = template.bg;
  formElements.fg.value = template.fg;
}

export function setAuthenticatedView(email) {
  ui.authState.textContent = `Angemeldet als ${email}`;
  ui.logoutBtn.classList.remove('hidden');
  ui.editorCard.classList.remove('hidden');
  ui.savedCard.classList.remove('hidden');
}

export function setLoggedOutView() {
  ui.authState.textContent = 'Nicht angemeldet';
  ui.logoutBtn.classList.add('hidden');
  ui.editorCard.classList.add('hidden');
  ui.savedCard.classList.add('hidden');
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
    const ruleCount = Array.isArray(entry.notification_rules) ? entry.notification_rules.length : 0;
    li.innerHTML = `
      <div>
        <strong>${entry.title}</strong>
        <p class="muted small">${entry.subtitle || 'Kein Untertitel'} · ${new Date(
      entry.created_at
    ).toLocaleString('de-DE')}</p>
        <p class="muted small">Typ: ${entry.card_program_type || 'generic'} · Push-Regeln: ${ruleCount}</p>
      </div>
      <a class="btn btn-secondary" href="https://api.qrserver.com/v1/create-qr-code/?size=420x420&data=${encodeURIComponent(
        entry.qr_content
      )}" target="_blank" rel="noreferrer">QR öffnen</a>
    `;
    ui.passList.appendChild(li);
  }
}

export function showToast(message, isError = false) {
  ui.toast.textContent = message;
  ui.toast.style.background = isError ? '#b42318' : '#111';
  ui.toast.classList.remove('hidden');
  setTimeout(() => ui.toast.classList.add('hidden'), 3200);
}
