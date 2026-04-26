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
  addNotificationRule,
  applyTemplateDefaults,
  formElements,
  getDesignById,
  getPassFormData,
  getTemplateById,
  initDesignSelect,
  initTemplateSelect,
  renderProgramFields,
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
  const selectedDesign = getDesignById(formData.designId);

  return {
    ...formData,
    customImageUrl: currentUploadedImageUrl,
    templateGradient: selectedDesign.gradient,
    foregroundColor: formData.foregroundColor || selectedDesign.fg
  };
}

function refreshPreview() {
  updatePreview(buildPreviewPayload());
}

function handleTemplateChange() {
  const template = getTemplateById(formElements.template.value);
  applyTemplateDefaults(template);
  renderProgramFields(template.programType || 'generic');
  refreshPreview();
}

function handleDesignChange() {
  const design = getDesignById(formElements.design.value);
  setTemplateColors(design);
  refreshPreview();
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

  if (passData.pushEnabled && !passData.notificationRules.length) {
    showToast('Push ist aktiv, aber es gibt keine gültige Regel.', true);
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

function handleAddNotificationRule() {
  addNotificationRule({ triggerType: 'time' });
}

function handleRuleLocationClick(event) {
  const locationButton = event.target.closest('.rule-location-btn');
  if (!locationButton) return;

  if (!navigator.geolocation) {
    showToast('Geolocation wird von diesem Browser nicht unterstützt.', true);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const row = locationButton.closest('.rule-row');
      if (!row) return;

      row.querySelector('.rule-lat').value = position.coords.latitude.toFixed(6);
      row.querySelector('.rule-lng').value = position.coords.longitude.toFixed(6);
      showToast('Standort für Regel übernommen.');
    },
    (error) => {
      showToast(`Standort konnte nicht gelesen werden: ${error.message}`, true);
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
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
    formElements.fg,
    formElements.coffeeTarget,
    formElements.coffeeCurrent,
    formElements.coffeeReward,
    formElements.streakAction,
    formElements.streakTarget,
    formElements.streakGrace,
    formElements.creditBalance,
    formElements.creditCurrency,
    formElements.creditThreshold
  ];

  previewFields.forEach((field) => field.addEventListener('input', refreshPreview));

  formElements.template.addEventListener('change', handleTemplateChange);
  formElements.design.addEventListener('change', handleDesignChange);

  formElements.upload.addEventListener('change', handleImageUpload);
  formElements.addRuleBtn.addEventListener('click', handleAddNotificationRule);
  ui.notificationRules.addEventListener('click', handleRuleLocationClick);
}

function init() {
  initTemplateSelect();
  initDesignSelect();
  addNotificationRule({
    name: 'Beispiel Reminder',
    triggerType: 'time',
    message: 'Denk an deine Karte!',
    sendAt: ''
  });

  handleTemplateChange();
  handleDesignChange();
  refreshPreview();
  wireEvents();
  bootstrapAuth();
}

init();
