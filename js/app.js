import {
  listPasses,
  loginWithEmail,
  logout,
  registerWithEmail,
  requestPasswordOtp,
  savePass,
  supabaseClient,
  uploadCustomImage
} from './api.js';
import {
  formElements,
  getPassFormData,
  getTemplateById,
  initTemplateSelect,
  renderSavedPasses,
  setAuthenticatedView,
  setLoggedOutView,
  setTemplateColors,
  showToast,
  ui,
  updatePreview
} from './ui.js';

let currentUser = null;
let currentUploadedImageUrl = '';

function buildPreviewPayload() {
  const formData = getPassFormData();
  const selectedTemplate = getTemplateById(formData.templateId);

  return {
    ...formData,
    customImageUrl: currentUploadedImageUrl,
    templateGradient: selectedTemplate.gradient,
    foregroundColor: formData.foregroundColor || selectedTemplate.fg
  };
}

function refreshPreview() {
  updatePreview(buildPreviewPayload());
}

async function refreshPasses() {
  if (!currentUser) {
    renderSavedPasses([]);
    return;
  }

  const { data, error } = await listPasses(currentUser.id);
  if (error) {
    showToast(`Laden fehlgeschlagen: ${error.message}`, true);
    return;
  }
  renderSavedPasses(data);
}

async function handleRegister() {
  const email = formElements.email.value.trim();
  const password = formElements.password.value.trim();

  const { error } = await registerWithEmail(email, password);
  if (error) {
    showToast(`Registrierung fehlgeschlagen: ${error.message}`, true);
    return;
  }

  showToast('Registrierung erfolgreich gestartet.');
}

async function handleLogin() {
  const email = formElements.email.value.trim();
  const password = formElements.password.value.trim();

  const { data, error } = await loginWithEmail(email, password);
  if (error) {
    showToast(`Login fehlgeschlagen: ${error.message}`, true);
    return;
  }

  currentUser = data.user;
  setAuthenticatedView(currentUser.email);
  showToast('Login erfolgreich.');
  await refreshPasses();
}

async function handleResetOtp() {
  const email = formElements.email.value.trim();
  if (!email) {
    showToast('Bitte zuerst eine E-Mail eingeben.', true);
    return;
  }

  const { error } = await requestPasswordOtp(email);
  if (error) {
    showToast(`OTP konnte nicht angefordert werden: ${error.message}`, true);
    return;
  }

  showToast('OTP/Reset-E-Mail wurde verschickt.');
}

async function handleLogout() {
  const { error } = await logout();
  if (error) {
    showToast(`Logout fehlgeschlagen: ${error.message}`, true);
    return;
  }

  currentUser = null;
  currentUploadedImageUrl = '';
  setLoggedOutView();
  showToast('Du wurdest abgemeldet.');
}

async function handleImageUpload(event) {
  const file = event.target.files?.[0];
  if (!file) {
    currentUploadedImageUrl = '';
    refreshPreview();
    return;
  }

  if (!currentUser) {
    showToast('Bitte zuerst einloggen, bevor du Bilder hochlädst.', true);
    event.target.value = '';
    return;
  }

  const { data, error } = await uploadCustomImage(file, currentUser.id);
  if (error) {
    showToast(`Upload fehlgeschlagen: ${error.message}`, true);
    return;
  }

  currentUploadedImageUrl = data.publicUrl;
  refreshPreview();
  showToast('Hintergrundbild hochgeladen.');
}

async function handleSavePass() {
  if (!currentUser) {
    showToast('Bitte zuerst anmelden.', true);
    return;
  }

  const passData = getPassFormData();
  if (!passData.title || !passData.qrContent) {
    showToast('Titel und QR-Inhalt sind Pflichtfelder.', true);
    return;
  }

  const { error } = await savePass(
    {
      ...passData,
      customImageUrl: currentUploadedImageUrl
    },
    currentUser.id
  );

  if (error) {
    showToast(`Speichern fehlgeschlagen: ${error.message}`, true);
    return;
  }

  showToast('Pass erfolgreich gespeichert.');
  await refreshPasses();
}

async function bootstrapAuth() {
  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  currentUser = session?.user ?? null;
  if (currentUser) {
    setAuthenticatedView(currentUser.email);
    await refreshPasses();
  } else {
    setLoggedOutView();
  }

  supabaseClient.auth.onAuthStateChange((_event, sessionData) => {
    currentUser = sessionData?.user ?? null;
    if (currentUser) {
      setAuthenticatedView(currentUser.email);
      refreshPasses();
    } else {
      setLoggedOutView();
      renderSavedPasses([]);
    }
  });
}

function wireEvents() {
  document.getElementById('register-btn').addEventListener('click', handleRegister);
  document.getElementById('login-btn').addEventListener('click', handleLogin);
  document.getElementById('reset-btn').addEventListener('click', handleResetOtp);
  document.getElementById('save-pass-btn').addEventListener('click', handleSavePass);
  ui.logoutBtn.addEventListener('click', handleLogout);

  const previewFields = [
    formElements.title,
    formElements.subtitle,
    formElements.description,
    formElements.qrContent,
    formElements.bg,
    formElements.fg
  ];

  previewFields.forEach((field) => field.addEventListener('input', refreshPreview));

  formElements.template.addEventListener('change', () => {
    const template = getTemplateById(formElements.template.value);
    setTemplateColors(template);
    refreshPreview();
  });

  formElements.upload.addEventListener('change', handleImageUpload);
}

function init() {
  initTemplateSelect();
  const defaultTemplate = getTemplateById(formElements.template.value);
  setTemplateColors(defaultTemplate);
  refreshPreview();
  wireEvents();
  bootstrapAuth();
}

init();
