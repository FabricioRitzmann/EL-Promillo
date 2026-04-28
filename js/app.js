import {
  addCompletionStat,
  listPasses,
  listPassStats,
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
  applyBannerColorPreset,
  askForConfirmation,
  fillEditorFromSavedPass,
  formElements,
  getPassFormData,
  getTemplateById,
  initTemplateSelect,
  initSectionDropdowns,
  initTitleBucketEditor,
  initTemplateGallery,
  clearFolderInput,
  onCreateFolder,
  onSavedCardFiltersChange,
  onSavedToolbarToggle,
  onSavedPassFolderChange,
  onSavedPassOpen,
  onSavedPassScan,
  renderStats,
  renderProgramFields,
  renderSavedPasses,
  renderWalletSimulation,
  resetNotificationRules,
  setActiveTab,
  setAuthenticatedView,
  setLoggedOutView,
  showToast,
  syncBannerFields,
  ui,
  updatePreview,
  openWalletSimulation
} from './ui.js';

let currentUser = null;
let currentUploadedImageUrl = '';
let currentUploadedBannerUrl = '';
let currentAccountLogoUrl = '';
let currentEditingPassId = null;
let latestPassEntries = [];
let latestPassStats = [];
let lastTemplateId = '';
let passFoldersById = {};
let savedFolderNames = [];
let savedCardsFilters = {
  folder: 'all',
  cardType: 'all',
  sort: 'newest'
};

function syncHeaderCompanyLogo() {
  if (!ui.headerCompanyLogo) return;

  if (currentAccountLogoUrl) {
    ui.headerCompanyLogo.src = currentAccountLogoUrl;
    ui.headerCompanyLogo.classList.remove('hidden');
    return;
  }

  ui.headerCompanyLogo.src = '';
  ui.headerCompanyLogo.classList.add('hidden');
}

function storageKeyForAccountLogo(userId) {
  return `passStudio.accountLogo.${userId}`;
}

function loadAccountLogo(userId) {
  if (!userId) {
    currentAccountLogoUrl = '';
    return;
  }

  currentAccountLogoUrl = localStorage.getItem(storageKeyForAccountLogo(userId)) || '';
}

function persistAccountLogo(userId, logoUrl) {
  if (!userId) return;
  if (!logoUrl) {
    localStorage.removeItem(storageKeyForAccountLogo(userId));
    return;
  }
  localStorage.setItem(storageKeyForAccountLogo(userId), logoUrl);
}

function syncAccountPopupFields() {
  if (ui.accountEmail) {
    ui.accountEmail.value = currentUser?.email || formElements.email.value.trim();
  }

  if (ui.accountPassword) {
    ui.accountPassword.value = formElements.password.value;
  }
}

function openAccountPopup() {
  syncAccountPopupFields();
  ui.accountPopup?.classList.remove('hidden');
}

function closeAccountPopup() {
  ui.accountPopup?.classList.add('hidden');
}

function updatePreviewPaneSizeOnScroll() {
  const previewPane = document.querySelector('.preview-pane');
  if (!previewPane) return;

  const isFullscreenLayout = isWindowCoveringScreen();
  previewPane.classList.toggle('is-windowed', !isFullscreenLayout);

  if (!isFullscreenLayout) {
    previewPane.classList.remove('is-expanded');
    return;
  }

  const bottomThresholdPx = 24;
  const scrolledBottom = window.scrollY + window.innerHeight;
  const docHeight = document.documentElement.scrollHeight;
  const hasReachedBottom = scrolledBottom >= docHeight - bottomThresholdPx;

  previewPane.classList.toggle('is-expanded', hasReachedBottom);
}

function isWindowCoveringScreen() {
  const widthGap = Math.abs(window.outerWidth - window.screen.availWidth);
  const heightGap = Math.abs(window.outerHeight - window.screen.availHeight);
  const allowedGapPx = 24;

  return widthGap <= allowedGapPx && heightGap <= allowedGapPx;
}

function buildPreviewPayload() {
  const formData = getPassFormData();
  return {
    ...formData,
    customImageUrl: currentUploadedImageUrl,
    customIconUrl: currentAccountLogoUrl,
    customBannerUrl: currentUploadedBannerUrl
  };
}

function refreshPreview() {
  updatePreview(buildPreviewPayload());
  syncHeaderCompanyLogo();
  syncPreviewWalletTabs();
}

function syncPreviewWalletTabs() {
  const selectedSkin = formElements.walletSkin?.value || 'apple';
  document.querySelectorAll('[data-wallet-skin-tab]').forEach((button) => {
    const isActive = button.dataset.walletSkinTab === selectedSkin;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-selected', String(isActive));
  });
}

function focusEditorTab() {
  setActiveTab('editor');
  requestAnimationFrame(() => setActiveTab('editor'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function handleTemplateChange() {
  const template = getTemplateById(formElements.template.value);
  applyTemplateDefaults(template);
  renderProgramFields(template.programType || 'generic');
  lastTemplateId = template.id;
  refreshPreview();
}

function handleTemplateGalleryApply(templateId) {
  const template = getTemplateById(templateId);
  renderProgramFields(template.programType || 'generic');
  lastTemplateId = template.id;
  refreshPreview();
  showToast(`Layout „${template.name}“ wurde angewendet.`);
}

async function handleNewPass() {
  const confirmed = await askForConfirmation({
    title: 'Neue Karte starten?',
    message: 'Deine aktuellen, noch nicht gespeicherten Änderungen gehen dabei verloren.',
    confirmLabel: 'Neue Karte'
  });

  if (!confirmed) {
    return;
  }

  currentEditingPassId = null;
  currentUploadedImageUrl = '';
  currentUploadedBannerUrl = '';
  document.getElementById('pass-form').reset();
  formElements.upload.value = '';
  applyTemplateDefaults(getTemplateById(formElements.template.value));
  renderProgramFields(getTemplateById(formElements.template.value).programType || 'generic');
  resetNotificationRules();
  addNotificationRule({
    name: 'Beispiel Reminder',
    triggerType: 'time',
    message: 'Denk an deine Karte!',
    sendAt: ''
  });
  lastTemplateId = formElements.template.value;
  syncBannerFields();
  applyBannerColorPreset();
  refreshPreview();
  showToast('Neue Karte gestartet.');
}

function storageKeyForSavedCards(userId) {
  return `passStudio.savedCards.${userId}`;
}

function loadSavedCardsOrganization(userId) {
  if (!userId) return;
  try {
    const rawValue = localStorage.getItem(storageKeyForSavedCards(userId));
    if (!rawValue) {
      passFoldersById = {};
      savedFolderNames = [];
      return;
    }
    const parsed = JSON.parse(rawValue);
    passFoldersById = parsed.passFoldersById || {};
    savedFolderNames = Array.isArray(parsed.savedFolderNames) ? parsed.savedFolderNames : [];
  } catch (_error) {
    passFoldersById = {};
    savedFolderNames = [];
  }
}

function persistSavedCardsOrganization() {
  if (!currentUser) return;
  localStorage.setItem(
    storageKeyForSavedCards(currentUser.id),
    JSON.stringify({
      passFoldersById,
      savedFolderNames
    })
  );
}

function pruneFolderAssignments() {
  const validPassIds = new Set(latestPassEntries.map((entry) => entry.id));
  passFoldersById = Object.fromEntries(
    Object.entries(passFoldersById).filter(([passId, folderName]) => {
      return validPassIds.has(passId) && (folderName === 'none' || savedFolderNames.includes(folderName));
    })
  );
}

function renderSavedCardsView() {
  renderSavedPasses(latestPassEntries, {
    folderAssignments: passFoldersById,
    folderNames: savedFolderNames,
    filters: savedCardsFilters
  });
}

async function refreshPasses() {
  if (!currentUser) {
    latestPassEntries = [];
    passFoldersById = {};
    savedFolderNames = [];
    renderSavedCardsView();
    return;
  }

  const { data, error } = await listPasses(currentUser.id);
  if (error) {
    showToast(`Laden fehlgeschlagen: ${error.message}`, true);
    return;
  }

  latestPassEntries = data || [];
  pruneFolderAssignments();
  persistSavedCardsOrganization();
  renderSavedCardsView();
}

function handleOpenWalletSimulation() {
  renderWalletSimulation({
    currentPass: buildPreviewPayload(),
    savedPasses: latestPassEntries
  });
  openWalletSimulation();
}

async function refreshStats() {
  if (!currentUser) return;
  const { data, error } = await listPassStats(currentUser.id);
  if (error) {
    showToast(`Statistik konnte nicht geladen werden: ${error.message}`, true);
    return;
  }
  latestPassStats = data || [];
  renderStats(latestPassStats);
}

function handleSavedPassFolderChange(passId, folderName) {
  passFoldersById[passId] = folderName;
  pruneFolderAssignments();
  persistSavedCardsOrganization();
  renderSavedCardsView();
}

function handleSavedCardsFilterChange(nextFilters) {
  savedCardsFilters = { ...savedCardsFilters, ...nextFilters };
  renderSavedCardsView();
}

function handleCreateFolder(folderNameInput) {
  const folderName = folderNameInput.trim();
  if (!folderName) {
    showToast('Bitte einen Ordnernamen eingeben.', true);
    return;
  }

  if (folderName.toLowerCase() === 'none' || folderName.toLowerCase() === 'all') {
    showToast('Dieser Ordnername ist reserviert.', true);
    return;
  }

  const alreadyExists = savedFolderNames.some((entry) => entry.toLowerCase() === folderName.toLowerCase());
  if (alreadyExists) {
    showToast('Ordner existiert bereits.', true);
    return;
  }

  savedFolderNames = [...savedFolderNames, folderName].sort((a, b) => a.localeCompare(b, 'de-DE', { sensitivity: 'base' }));
  persistSavedCardsOrganization();
  clearFolderInput();
  showToast(`Ordner „${folderName}“ erstellt.`);
  renderSavedCardsView();
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
  loadSavedCardsOrganization(currentUser.id);
  loadAccountLogo(currentUser.id);
  setAuthenticatedView(currentUser.email);
  syncAccountPopupFields();
  syncHeaderCompanyLogo();
  refreshPreview();
  showToast('Login erfolgreich.');
  await refreshPasses();
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  await handleLogin();
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
  currentUploadedBannerUrl = '';
  currentAccountLogoUrl = '';
  currentEditingPassId = null;
  passFoldersById = {};
  savedFolderNames = [];
  savedCardsFilters = { folder: 'all', cardType: 'all', sort: 'newest' };
  renderSavedCardsView();
  setLoggedOutView();
  closeAccountPopup();
  syncAccountPopupFields();
  syncHeaderCompanyLogo();
  refreshPreview();
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

async function handleAccountLogoUpload(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }
  if (!currentUser) {
    showToast('Bitte zuerst einloggen, bevor du Bilder hochlädst.', true);
    event.target.value = '';
    return;
  }
  const { data, error } = await uploadCustomImage(file, currentUser.id);
  if (error) {
    showToast(`Logo-Upload fehlgeschlagen: ${error.message}`, true);
    return;
  }
  currentAccountLogoUrl = data.publicUrl;
  persistAccountLogo(currentUser.id, currentAccountLogoUrl);
  syncHeaderCompanyLogo();
  refreshPreview();
  showToast('Firmenlogo gespeichert. Du kannst es jederzeit ersetzen.');
}

async function handleBannerUpload(event) {
  const file = event.target.files?.[0];
  if (!file) {
    currentUploadedBannerUrl = '';
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
    showToast(`Banner-Upload fehlgeschlagen: ${error.message}`, true);
    return;
  }
  currentUploadedBannerUrl = data.publicUrl;
  refreshPreview();
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

  if (currentEditingPassId) {
    const confirmed = await askForConfirmation({
      title: 'Änderungen überschreiben?',
      message: 'Du bearbeitest eine bereits gespeicherte Karte. Diese Version wirklich überschreiben?',
      confirmLabel: 'Überschreiben'
    });

    if (!confirmed) {
      showToast('Speichern abgebrochen.');
      return;
    }
  }

  const currentEntry = currentEditingPassId
    ? latestPassEntries.find((entry) => entry.id === currentEditingPassId)
    : null;

  const { error } = await savePass(
    {
      ...passData,
      id: currentEditingPassId,
      templateStoragePath: currentEntry?.template_storage_path || '',
      customImageUrl: currentUploadedImageUrl,
      customIconUrl: currentAccountLogoUrl,
      customBannerUrl: currentUploadedBannerUrl
    },
    currentUser.id
  );

  if (error) {
    showToast(`Speichern fehlgeschlagen: ${error.message}`, true);
    return;
  }

  showToast(currentEditingPassId ? 'Karte erfolgreich aktualisiert.' : 'Pass erfolgreich gespeichert.');
  await refreshPasses();
  await refreshStats();
}

async function handleCreateNewPass() {
  if (currentEditingPassId) {
    const confirmed = await askForConfirmation({
      title: 'Bearbeitung verlassen?',
      message: 'Du verlässt die aktuell geöffnete Karte und erstellst eine neue. Nicht gespeicherte Änderungen gehen verloren.',
      confirmLabel: 'Neue Karte'
    });

    if (!confirmed) {
      return;
    }
  }

  currentEditingPassId = null;
  currentUploadedImageUrl = '';
  currentUploadedBannerUrl = '';
  formElements.upload.value = '';
  initTemplateSelect();
  resetNotificationRules();
  addNotificationRule({
    name: 'Beispiel Reminder',
    triggerType: 'time',
    message: 'Denk an deine Karte!',
    sendAt: ''
  });
  lastTemplateId = formElements.template.value;
  applyTemplateDefaults(getTemplateById(formElements.template.value));
  renderProgramFields(getTemplateById(formElements.template.value).programType || 'generic');
  syncBannerFields();
  applyBannerColorPreset();
  refreshPreview();
  showToast('Editor ist jetzt bereit für eine neue Karte.');
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

async function handleOpenSavedPass(passId) {
  const selectedPass = latestPassEntries.find((entry) => entry.id === passId);
  if (!selectedPass) {
    showToast('Gespeicherte Karte wurde nicht gefunden.', true);
    return;
  }

  const confirmed = await askForConfirmation({
    title: 'Gespeicherte Karte öffnen?',
    message: 'Aktuelle Eingaben werden überschrieben. Möchtest du fortfahren?',
    confirmLabel: 'Öffnen'
  });

  if (!confirmed) {
    return;
  }

  fillEditorFromSavedPass(selectedPass);
  currentEditingPassId = selectedPass.id;
  currentUploadedImageUrl = selectedPass.custom_image_url || '';
  currentUploadedBannerUrl = selectedPass.custom_banner_url || '';
  lastTemplateId = selectedPass.template_id || formElements.template.value;
  setActiveTab('editor');
  syncAccountPopupFields();
  refreshPreview();
  showToast('Karte im Editor geöffnet.');
}

async function handleScanPass(passId) {
  const selectedPass = latestPassEntries.find((entry) => entry.id === passId);
  if (!selectedPass) return;
  const programConfig = selectedPass.program_config || {};
  const target = selectedPass.card_program_type === 'coffee' ? Number(programConfig.stampTarget || 0) : Number(programConfig.targetDays || 0);
  const current = Number(programConfig.currentStamps || 0);
  if (!target || current < target) {
    showToast('Karte ist noch nicht voll und kann nicht gescannt werden.', true);
    return;
  }
  const confirmed = await askForConfirmation({
    title: 'Karte scannen und neu starten?',
    message: 'Die Karte wird auf 0 zurückgesetzt und als abgeschlossen gezählt.',
    confirmLabel: 'Scannen'
  });
  if (!confirmed) return;

  const { error: statError } = await addCompletionStat(currentUser.id, selectedPass.id, selectedPass.title);
  if (statError) {
    showToast(`Statistik speichern fehlgeschlagen: ${statError.message}`, true);
    return;
  }

  programConfig.currentStamps = 0;
  const { error } = await savePass(
    {
      id: selectedPass.id,
      title: selectedPass.title,
      subtitle: selectedPass.subtitle,
      description: selectedPass.description,
      qrContent: selectedPass.qr_content,
      businessName: selectedPass.business_name,
      businessCategory: selectedPass.business_category,
      templateStoragePath: selectedPass.template_storage_path,
      templateId: selectedPass.template_id,
      iconId: selectedPass.icon_id,
      backgroundTemplateId: selectedPass.background_template_id,
      backgroundColor: selectedPass.background_color,
      foregroundColor: selectedPass.foreground_color,
      customImageUrl: selectedPass.custom_image_url,
      customIconUrl: currentAccountLogoUrl,
      customBannerUrl: selectedPass.custom_banner_url,
      banner: {
        enabled: selectedPass.banner_enabled,
        text: selectedPass.banner_text,
        preset: selectedPass.banner_preset,
        backgroundColor: selectedPass.banner_background_color,
        textColor: selectedPass.banner_text_color,
        shape: selectedPass.banner_shape,
        width: selectedPass.banner_width,
        height: selectedPass.banner_height,
        positionX: selectedPass.banner_position_x,
        positionY: selectedPass.banner_position_y
      },
      cardProgramType: selectedPass.card_program_type,
      programConfig,
      pushEnabled: selectedPass.push_enabled,
      notificationRules: selectedPass.notification_rules
    },
    currentUser.id
  );
  if (error) {
    showToast(`Karte zurücksetzen fehlgeschlagen: ${error.message}`, true);
    return;
  }
  showToast('Karte gescannt und zurückgesetzt.');
  await refreshPasses();
  await refreshStats();
}

async function bootstrapAuth() {
  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  currentUser = session?.user ?? null;
  if (currentUser) {
    loadSavedCardsOrganization(currentUser.id);
    loadAccountLogo(currentUser.id);
    setAuthenticatedView(currentUser.email);
    syncHeaderCompanyLogo();
    refreshPreview();
    setActiveTab('editor');
    await refreshPasses();
    await refreshStats();
  } else {
    currentAccountLogoUrl = '';
    setLoggedOutView();
    syncHeaderCompanyLogo();
    refreshPreview();
    renderSavedCardsView();
  }

  supabaseClient.auth.onAuthStateChange((_event, sessionData) => {
    currentUser = sessionData?.user ?? null;
    if (currentUser) {
      loadSavedCardsOrganization(currentUser.id);
      loadAccountLogo(currentUser.id);
      setAuthenticatedView(currentUser.email);
      syncHeaderCompanyLogo();
      refreshPreview();
      setActiveTab('editor');
      refreshPasses();
      refreshStats();
    } else {
      currentAccountLogoUrl = '';
      passFoldersById = {};
      savedFolderNames = [];
      savedCardsFilters = { folder: 'all', cardType: 'all', sort: 'newest' };
      setLoggedOutView();
      syncHeaderCompanyLogo();
      refreshPreview();
      renderSavedCardsView();
    }
  });
}

function wireEvents() {
  document.getElementById('auth-form').addEventListener('submit', handleAuthSubmit);
  document.getElementById('register-btn').addEventListener('click', handleRegister);
  document.getElementById('login-btn').addEventListener('click', handleLogin);
  document.getElementById('reset-btn').addEventListener('click', handleResetOtp);
  document.getElementById('save-pass-btn').addEventListener('click', handleSavePass);
  document.getElementById('new-pass-btn').addEventListener('click', handleCreateNewPass);
  ui.logoutBtn.addEventListener('click', handleLogout);
  ui.accountBtn?.addEventListener('click', openAccountPopup);
  ui.accountPopupCloseBtn?.addEventListener('click', closeAccountPopup);

  const previewFields = [
    formElements.title,
    formElements.subtitle,
    formElements.description,
    formElements.qrContent,
    formElements.icon,
    formElements.streakIcon,
    formElements.bg,
    formElements.fg,
    formElements.walletSkin,
    formElements.backgroundTemplate,
    formElements.bannerEnabled,
    formElements.bannerText,
    formElements.bannerColor,
    formElements.bannerBg,
  formElements.bannerFg,
  formElements.bannerShape,
  formElements.bannerWidth,
  formElements.bannerHeight,
  formElements.bannerX,
  formElements.bannerY,
  formElements.coffeeTarget,
    formElements.coffeeCurrent,
    formElements.coffeeReward,
    formElements.coffeeShape,
    formElements.streakAction,
    formElements.streakTarget,
    formElements.streakCurrent,
    formElements.streakGrace,
    formElements.streakShape,
    formElements.creditBalance,
    formElements.creditCurrency,
    formElements.creditThreshold,
    formElements.stampBorderColor,
    formElements.stampSize,
    formElements.stampBorderWidth,
    formElements.stampOffsetX,
    formElements.stampOffsetY
  ];

  previewFields.forEach((field) => field.addEventListener('input', refreshPreview));
  previewFields.forEach((field) => field.addEventListener('change', refreshPreview));

  formElements.template.addEventListener('change', handleTemplateChange);
  formElements.bannerEnabled.addEventListener('change', syncBannerFields);
  formElements.bannerColor.addEventListener('change', applyBannerColorPreset);

  formElements.upload.addEventListener('change', handleImageUpload);
  formElements.accountLogoUpload?.addEventListener('change', handleAccountLogoUpload);
  formElements.bannerUpload.addEventListener('change', handleBannerUpload);
  formElements.addRuleBtn.addEventListener('click', handleAddNotificationRule);
  ui.notificationRules.addEventListener('click', handleRuleLocationClick);
  onSavedPassOpen(handleOpenSavedPass);
  onSavedPassScan(handleScanPass);
  onSavedPassFolderChange(handleSavedPassFolderChange);
  onSavedCardFiltersChange(handleSavedCardsFilterChange);
  onCreateFolder(handleCreateFolder);
  onSavedToolbarToggle();
  ui.openWalletSimBtn?.addEventListener('click', handleOpenWalletSimulation);
  document.querySelectorAll('.tab-btn').forEach((button) =>
    button.addEventListener('click', () => setActiveTab(button.dataset.tab))
  );
  window.addEventListener('scroll', updatePreviewPaneSizeOnScroll, { passive: true });
  window.addEventListener('resize', updatePreviewPaneSizeOnScroll);
  document.addEventListener('click', (event) => {
    if (!ui.accountPopup || ui.accountPopup.classList.contains('hidden')) {
      return;
    }

    const clickedInsidePopup = ui.accountPopup.contains(event.target);
    const clickedButton = ui.accountBtn?.contains(event.target);
    if (!clickedInsidePopup && !clickedButton) {
      closeAccountPopup();
    }
  });
  document.querySelectorAll('[data-wallet-skin-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      const selectedSkin = button.dataset.walletSkinTab;
      if (!selectedSkin || formElements.walletSkin.value === selectedSkin) {
        return;
      }

      formElements.walletSkin.value = selectedSkin;
      formElements.walletSkin.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });
}

function init() {
  initTemplateSelect();
  initTemplateGallery(handleTemplateGalleryApply);
  initSectionDropdowns();
  initTitleBucketEditor(refreshPreview);
  resetNotificationRules();
  addNotificationRule({
    name: 'Beispiel Reminder',
    triggerType: 'time',
    message: 'Denk an deine Karte!',
    sendAt: ''
  });

  lastTemplateId = formElements.template.value;
  syncBannerFields();
  applyBannerColorPreset();
  setActiveTab('editor');
  handleTemplateChange();
  refreshPreview();
  syncAccountPopupFields();
  syncHeaderCompanyLogo();
  wireEvents();
  updatePreviewPaneSizeOnScroll();
  bootstrapAuth();
}

init();
