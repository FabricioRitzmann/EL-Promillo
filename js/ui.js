import { passTemplates } from './config.js';

export const ui = {
  authState: document.getElementById('auth-state'),
  logoutBtn: document.getElementById('logout-btn'),
  authCard: document.getElementById('auth-card'),
  editorCard: document.getElementById('editor-card'),
  savedCard: document.getElementById('saved-card'),
  toast: document.getElementById('toast'),
  passList: document.getElementById('saved-pass-list')
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
  upload: document.getElementById('pass-upload')
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
  return {
    title: formElements.title.value.trim(),
    subtitle: formElements.subtitle.value.trim(),
    description: formElements.description.value.trim(),
    qrContent: formElements.qrContent.value.trim(),
    templateId: formElements.template.value,
    backgroundColor: formElements.bg.value,
    foregroundColor: formElements.fg.value
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
    li.innerHTML = `
      <div>
        <strong>${entry.title}</strong>
        <p class="muted small">${entry.subtitle || 'Kein Untertitel'} · ${new Date(
      entry.created_at
    ).toLocaleString('de-DE')}</p>
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
