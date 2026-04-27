import {
  addCompletionStat,
  createPassesExcelExport,
  listPasses,
  listPassStats,
  loginWithEmail,
  logout,
  requestPasswordResetLink,
  registerWithEmail,
  requestPasswordOtp,
  savePass,
  supabaseClient,
  updateCurrentUserPassword,
  uploadCustomImage
} from './api.js';
import { appConfig } from './config.js';
import {
  addNotificationRule,
  applyTemplatePresetFromGallery,
  applyTemplateDefaults,
  applyBannerColorPreset,
  askForConfirmation,
  fillEditorFromSavedPass,
  formElements,
  getPassFormData,
  getTemplateById,
  initTemplateSelect,
  initSectionDropdowns,
  clearFolderInput,
  onCreateFolder,
  onSavedCardFiltersChange,
  onSavedToolbarToggle,
  onSavedPassFolderChange,
  onSavedPassOpen,
  onSavedPassScan,
  onTemplateGalleryUse,
  renderStats,
  renderProgramFields,
  renderEditorFolderOptions,
  renderSavedPasses,
  renderWalletSimulation,
  resetNotificationRules,
  setActiveTab,
  setAuthenticatedView,
  setLoggedOutView,
  setResetTabVisibility,
  showToast,
  syncBannerFields,
  ui,
  updatePreview,
  openWalletSimulation,
  getLayoutConfig,
  getPreviewMode,
  setLayoutConfig,
  setPreviewMode,
  resetLayoutConfig
} from './ui.js';
import { setupWalletDragDrop } from './walletDrag.js';
import { mapEditorToApplePass, mapEditorToGoogleWallet, mapEditorToSamsungWallet } from './walletMappers.js';

let currentUser = null;
let currentUploadedImageUrl = '';
let currentUploadedIconUrl = '';
let currentUploadedBannerUrl = '';
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
let destroyDragDrop = null;
let currentPreviewMode = 'horizontal';
const rememberSessionKey = 'passStudio.auth.rememberSession';
const rememberedCredentialsKey = 'passStudio.auth.rememberedCredentials';
const sessionMarkerKey = 'passStudio.auth.activeSessionMarker';
let authBootstrapPromise = null;

function codeRegistryStorageKey(userId) {
  return `passStudio.codeRegistry.${userId}`;
}

function isRememberSessionEnabled() {
  return localStorage.getItem(rememberSessionKey) === '1';
}

function setRememberSessionPreference(enabled) {
  localStorage.setItem(rememberSessionKey, enabled ? '1' : '0');
}

function saveRememberedCredentials(email, password) {
  const normalizedEmail = String(email || '').trim();
  const normalizedPassword = String(password || '').trim();
  if (!normalizedEmail || !normalizedPassword) {
    localStorage.removeItem(rememberedCredentialsKey);
    return;
  }
  localStorage.setItem(
    rememberedCredentialsKey,
    JSON.stringify({
      email: normalizedEmail,
      password: normalizedPassword
    })
  );
}

function loadRememberedCredentials() {
  try {
    const raw = localStorage.getItem(rememberedCredentialsKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.email || !parsed?.password) return null;
    return {
      email: String(parsed.email).trim(),
      password: String(parsed.password).trim()
    };
  } catch (_error) {
    return null;
  }
}

function clearRememberedCredentials() {
  localStorage.removeItem(rememberedCredentialsKey);
}

function setActiveSessionMarker() {
  sessionStorage.setItem(sessionMarkerKey, '1');
}

function hasActiveSessionMarker() {
  return sessionStorage.getItem(sessionMarkerKey) === '1';
}

function loadCodeRegistry(userId) {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(codeRegistryStorageKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map((entry) => String(entry).trim()).filter(Boolean) : [];
  } catch (_error) {
    return [];
  }
}

function saveCodeRegistry(userId, values = []) {
  if (!userId) return;
  const normalized = Array.from(new Set(values.map((entry) => String(entry).trim()).filter(Boolean)));
  localStorage.setItem(codeRegistryStorageKey(userId), JSON.stringify(normalized));
}

function getAccountCodePrefix(userId) {
  return String(userId || '')
    .replace(/[^a-z0-9]/gi, '')
    .slice(0, 8)
    .toUpperCase();
}

function createCodeValue(type, userId) {
  const accountPrefix = getAccountCodePrefix(userId) || 'ACCOUNT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = crypto.randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase();
  return `${type}-${accountPrefix}-${timestamp}-${randomPart}`;
}

function collectUsedCodes(excludePassId = null) {
  const usedCodes = new Set();
  latestPassEntries.forEach((entry) => {
    if (excludePassId && entry.id === excludePassId) return;

    const qrContent = String(entry.qr_content || '').trim();
    const walletBarcode = String(entry.wallet_template_config?.barcodeConfig?.value || '').trim();
    const serial = String(entry.passkit_config?.serialNumber || '').trim();
    const passkitMessage = String(entry.passkit_config?.barcode?.message || '').trim();

    [qrContent, walletBarcode, serial, passkitMessage].forEach((value) => {
      if (value) usedCodes.add(value);
    });
  });
  return usedCodes;
}

function getUniqueCodeValue(type, userId, usedCodes) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const candidate = createCodeValue(type, userId);
    if (!usedCodes.has(candidate)) {
      usedCodes.add(candidate);
      return candidate;
    }
  }
  const fallback = `${type}-${crypto.randomUUID()}`;
  usedCodes.add(fallback);
  return fallback;
}

function applyAutomaticCodes(passData) {
  if (!currentUser?.id) return passData;

  const usedCodes = collectUsedCodes(currentEditingPassId);
  const registryCodes = loadCodeRegistry(currentUser.id);
  registryCodes.forEach((value) => usedCodes.add(value));

  const isEditing = Boolean(currentEditingPassId);
  const currentBarcodeValue = String(passData.barcodeConfig?.value || '').trim();
  const currentQrValue = String(passData.qrContent || '').trim();
  const currentSerialValue = String(passData.passkitConfig?.serialNumber || '').trim();
  const currentMessageValue = String(passData.passkitConfig?.barcode?.message || '').trim();
  if (isEditing) {
    [currentQrValue, currentBarcodeValue, currentSerialValue, currentMessageValue].forEach((value) => {
      if (value) usedCodes.delete(value);
    });
  }

  const qrContent = !isEditing || !currentQrValue || usedCodes.has(currentQrValue) ? getUniqueCodeValue('QR', currentUser.id, usedCodes) : currentQrValue;
  const barcodeValue =
    !isEditing || !currentBarcodeValue || usedCodes.has(currentBarcodeValue)
      ? getUniqueCodeValue(passData.barcodeConfig?.type || 'BARCODE', currentUser.id, usedCodes)
      : currentBarcodeValue;
  const serialNumber = !isEditing || !currentSerialValue || usedCodes.has(currentSerialValue) ? getUniqueCodeValue('SERIAL', currentUser.id, usedCodes) : currentSerialValue;
  const passkitMessage =
    !isEditing || !currentMessageValue || usedCodes.has(currentMessageValue)
      ? getUniqueCodeValue(passData.passkitConfig?.barcode?.format || 'MESSAGE', currentUser.id, usedCodes)
      : currentMessageValue;

  saveCodeRegistry(currentUser.id, [...registryCodes, qrContent, barcodeValue, serialNumber, passkitMessage]);

  return {
    ...passData,
    qrContent,
    barcodeConfig: {
      ...passData.barcodeConfig,
      value: barcodeValue
    },
    passkitConfig: {
      ...passData.passkitConfig,
      serialNumber,
      barcode: {
        ...passData.passkitConfig?.barcode,
        messageEncoding: passData.passkitConfig?.barcode?.messageEncoding || 'utf-8',
        message: passkitMessage,
        altText: passData.barcodeConfig?.showText ? barcodeValue : ''
      }
    }
  };
}

function normalizeFolderNames(folderNames = []) {
  const uniqueNames = new Map();
  folderNames.forEach((entry) => {
    const normalized = String(entry || '').trim();
    if (!normalized) return;
    const reservedName = normalized.toLowerCase() === 'none' || normalized.toLowerCase() === 'all';
    if (reservedName) return;
    const key = normalized.toLocaleLowerCase('de-DE');
    if (!uniqueNames.has(key)) {
      uniqueNames.set(key, normalized);
    }
  });
  return Array.from(uniqueNames.values()).sort((a, b) => a.localeCompare(b, 'de-DE', { sensitivity: 'base' }));
}

function syncFolderNamesFromAssignments() {
  const folderNamesFromAssignments = Object.values(passFoldersById).filter((folderName) => folderName && folderName !== 'none');
  savedFolderNames = normalizeFolderNames([...savedFolderNames, ...folderNamesFromAssignments]);
}

function updatePreviewPanePlacement() {
  const previewPane = document.querySelector('.preview-pane');
  if (!previewPane) return;
  previewPane.classList.toggle('is-horizontal-mode', currentPreviewMode === 'horizontal');
}

function buildPreviewPayload() {
  const formData = getPassFormData();
  return {
    ...formData,
    customImageUrl: currentUploadedImageUrl,
    customIconUrl: currentUploadedIconUrl,
    customBannerUrl: currentUploadedBannerUrl,
    previewMode: getPreviewMode()
  };
}

function refreshPreview() {
  updatePreview(buildPreviewPayload());
  if (destroyDragDrop) destroyDragDrop();
  destroyDragDrop = null;
  if (currentPreviewMode === 'horizontal') {
    destroyDragDrop = setupWalletDragDrop({
      container: document.getElementById('pass-preview'),
      getLayout: () => getLayoutConfig(),
      onLayoutChange: (nextLayout) => {
        setLayoutConfig(nextLayout);
        updatePreview(buildPreviewPayload());
      },
      snap: 2
    });
  }
  syncPreviewWalletTabs();
  syncPreviewModeTabs();
  updatePreviewPanePlacement();
}

function syncPreviewWalletTabs() {
  const selectedSkin = formElements.walletSkin?.value || 'apple';
  document.querySelectorAll('[data-wallet-skin-tab]').forEach((button) => {
    const isActive = button.dataset.walletSkinTab === selectedSkin;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-selected', String(isActive));
  });
}


function syncPreviewModeTabs() {
  document.querySelectorAll('[data-preview-mode]').forEach((button) => {
    const isActive = button.dataset.previewMode === currentPreviewMode;
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

function handlePreviewModeToggle(mode) {
  currentPreviewMode = mode === 'vertical' ? 'vertical' : 'horizontal';
  setPreviewMode(mode);
  refreshPreview();
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
  currentUploadedIconUrl = '';
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
  setPreviewMode('horizontal');
  applyBannerColorPreset();
  currentPreviewMode = 'horizontal';
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
    syncFolderNamesFromAssignments();
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
  syncFolderNamesFromAssignments();
}

function renderSavedCardsView() {
  const selectedEditorFolder = formElements.folder?.value || 'none';
  renderEditorFolderOptions(savedFolderNames, selectedEditorFolder);
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
  syncFolderNamesFromAssignments();
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
  savedFolderNames = normalizeFolderNames(savedFolderNames);
  persistSavedCardsOrganization();
  clearFolderInput();
  showToast(`Ordner „${folderName}“ erstellt.`);
  renderSavedCardsView();
}

function handleExportExcel() {
  if (!latestPassEntries.length) {
    showToast('Es sind keine gespeicherten Karten für den Export vorhanden.', true);
    return;
  }

  const { fileName, downloadUrl } = createPassesExcelExport(latestPassEntries);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  showToast('Excel-Datei wurde erstellt und heruntergeladen.');
}

function buildRecoveryRedirectUrl() {
  const url = new URL(window.location.href);
  url.hash = '';
  url.searchParams.set('recovery', '1');
  return url.toString();
}

function clearRecoveryUrlState() {
  const cleanedUrl = new URL(window.location.href);
  cleanedUrl.hash = '';
  cleanedUrl.searchParams.delete('recovery');
  window.history.replaceState({}, '', cleanedUrl.toString());
}

function isRecoveryLinkOpened() {
  const hash = window.location.hash.replace(/^#/, '');
  const hashParams = new URLSearchParams(hash);
  const hasRecoveryType = hashParams.get('type') === 'recovery';
  const hasRecoveryQueryFlag = new URLSearchParams(window.location.search).get('recovery') === '1';
  return hasRecoveryType || hasRecoveryQueryFlag;
}

function getFriendlyAuthErrorMessage(errorMessage) {
  const normalized = String(errorMessage || '').toLowerCase();

  if (normalized.includes('email not confirmed')) {
    return 'E-Mail noch nicht bestätigt. Prüfe dein Postfach oder deaktiviere in Supabase (Auth > Email) die Option "Confirm email".';
  }

  if (normalized.includes('invalid login credentials')) {
    return 'Login fehlgeschlagen: E-Mail oder Passwort sind falsch.';
  }

  if (normalized.includes('signup is disabled')) {
    return 'Registrierung ist in Supabase deaktiviert. Aktiviere den Email-Provider unter Auth > Providers.';
  }

  return errorMessage || 'Unbekannter Auth-Fehler';
}

async function handleRegister() {
  if (authBootstrapPromise) {
    await authBootstrapPromise;
  }

  const email = formElements.email.value.trim();
  const password = formElements.password.value.trim();

  const { error } = await registerWithEmail(email, password);
  if (error) {
    showToast(`Registrierung fehlgeschlagen: ${getFriendlyAuthErrorMessage(error.message)}`, true);
    return;
  }

  showToast('Registrierung erfolgreich gestartet. Falls aktiviert, bestätige jetzt die E-Mail und logge dich danach ein.');
}

async function handleLogin() {
  if (authBootstrapPromise) {
    await authBootstrapPromise;
  }

  const authForm = document.getElementById('auth-form');
  if (authForm && !authForm.reportValidity()) {
    return;
  }

  const email = formElements.email.value.trim();
  const password = formElements.password.value.trim();
  const rememberSession = Boolean(formElements.rememberMe?.checked);

  const { data, error } = await loginWithEmail(email, password);
  if (error) {
    showToast(getFriendlyAuthErrorMessage(error.message), true);
    return;
  }

  const authenticatedUser = data?.user ?? null;
  if (!authenticatedUser) {
    const {
      data: { user },
      error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      showToast('Login konnte nicht bestätigt werden. Bitte versuche es erneut.', true);
      return;
    }

    currentUser = user;
  } else {
    currentUser = authenticatedUser;
  }

  setRememberSessionPreference(rememberSession);
  if (rememberSession) {
    saveRememberedCredentials(email, password);
  } else {
    clearRememberedCredentials();
  }
  setActiveSessionMarker();
  loadSavedCardsOrganization(currentUser.id);
  setAuthenticatedView(currentUser.email);
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

  showToast('Einmalpasswort wurde per E-Mail verschickt.');
}

async function handleResetLinkRequest() {
  const email = formElements.email.value.trim();
  if (!email) {
    showToast('Bitte zuerst eine E-Mail eingeben.', true);
    return;
  }

  const { error } = await requestPasswordResetLink(email, buildRecoveryRedirectUrl());
  if (error) {
    showToast(`Reset-Link konnte nicht angefordert werden: ${error.message}`, true);
    return;
  }

  showToast('Reset-Link wurde per E-Mail verschickt.');
}

async function handleSaveNewPassword(event) {
  event.preventDefault();
  const nextPassword = formElements.newPassword?.value.trim() || '';
  const confirmPassword = formElements.confirmNewPassword?.value.trim() || '';

  if (!nextPassword || !confirmPassword) {
    showToast('Bitte beide Passwort-Felder ausfüllen.', true);
    return;
  }

  if (nextPassword !== confirmPassword) {
    showToast('Die beiden Passwörter sind nicht identisch.', true);
    return;
  }

  const { error } = await updateCurrentUserPassword(nextPassword);
  if (error) {
    showToast(`Passwort konnte nicht aktualisiert werden: ${error.message}`, true);
    return;
  }

  if (formElements.newPassword) formElements.newPassword.value = '';
  if (formElements.confirmNewPassword) formElements.confirmNewPassword.value = '';
  clearRecoveryUrlState();
  showToast('Passwort erfolgreich geändert. Bitte neu einloggen.');
  await handleLogout();
}

async function handleLogout() {
  const { error } = await logout();
  if (error) {
    showToast(`Logout fehlgeschlagen: ${error.message}`, true);
    return;
  }

  currentUser = null;
  clearRememberedCredentials();
  setRememberSessionPreference(false);
  sessionStorage.removeItem(sessionMarkerKey);
  currentUploadedImageUrl = '';
  currentUploadedIconUrl = '';
  currentUploadedBannerUrl = '';
  currentEditingPassId = null;
  passFoldersById = {};
  savedFolderNames = [];
  savedCardsFilters = { folder: 'all', cardType: 'all', sort: 'newest' };
  renderSavedCardsView();
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

async function handleIconUpload(event) {
  const file = event.target.files?.[0];
  if (!file) {
    currentUploadedIconUrl = '';
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
    showToast(`Icon-Upload fehlgeschlagen: ${error.message}`, true);
    return;
  }
  currentUploadedIconUrl = data.publicUrl;
  refreshPreview();
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

  const generatedPassData = applyAutomaticCodes(getPassFormData());
  const passData = generatedPassData;
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

  const { data, error } = await savePass(
    {
      ...passData,
      id: currentEditingPassId,
      templateStoragePath: currentEntry?.template_storage_path || '',
      customImageUrl: currentUploadedImageUrl,
      customIconUrl: currentUploadedIconUrl,
      customBannerUrl: currentUploadedBannerUrl,
      walletTemplateConfig: {
        templateType: passData.templateType,
        previewMode: passData.previewMode,
        designConfig: {
          primaryColor: passData.backgroundColor,
          textColor: passData.foregroundColor,
          labelColor: passData.passkitConfig?.labelColor || 'rgba(255,255,255,0.75)',
          borderRadius: 16
        },
        fields: passData.fields,
        barcodeConfig: passData.barcodeConfig,
        stampConfig: passData.stampConfig,
        layoutConfig: passData.layoutConfig,
        exports: {
          apple: mapEditorToApplePass(passData),
          google: mapEditorToGoogleWallet(passData),
          samsung: mapEditorToSamsungWallet(passData)
        }
      }
    },
    currentUser.id
  );

  if (error) {
    showToast(`Speichern fehlgeschlagen: ${error.message}`, true);
    return;
  }

  formElements.qrContent.value = passData.qrContent;
  if (formElements.barcodeValue) formElements.barcodeValue.value = passData.barcodeConfig?.value || '';
  if (formElements.passkitSerialNumber) formElements.passkitSerialNumber.value = passData.passkitConfig?.serialNumber || '';
  if (formElements.passkitMessageEncoding) formElements.passkitMessageEncoding.value = passData.passkitConfig?.barcode?.messageEncoding || 'utf-8';

  const savedPassId = currentEditingPassId || data?.id || null;
  const selectedFolder = passData.folderName || 'none';
  if (savedPassId) {
    passFoldersById[savedPassId] = selectedFolder;
    persistSavedCardsOrganization();
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
  currentUploadedIconUrl = '';
  currentUploadedBannerUrl = '';
  formElements.upload.value = '';
  initTemplateSelect();
  setPreviewMode('horizontal');
  resetLayoutConfig();
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
  if (formElements.folder) {
    formElements.folder.value = 'none';
  }
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
  currentUploadedIconUrl = selectedPass.custom_icon_url || '';
  currentUploadedBannerUrl = selectedPass.custom_banner_url || '';
  lastTemplateId = selectedPass.template_id || formElements.template.value;
  if (formElements.folder) {
    formElements.folder.value = passFoldersById[selectedPass.id] || 'none';
  }
  currentPreviewMode = selectedPass.wallet_template_config?.previewMode === 'vertical' ? 'vertical' : 'horizontal';
  setPreviewMode(currentPreviewMode);
  setActiveTab('editor');
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
      customIconUrl: selectedPass.custom_icon_url,
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
      notificationRules: selectedPass.notification_rules,
      walletTemplateConfig: selectedPass.wallet_template_config || null
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
  if (!isRememberSessionEnabled() && !hasActiveSessionMarker()) {
    await supabaseClient.auth.signOut({ scope: 'local' });
  }

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  currentUser = session?.user ?? null;
  if (!currentUser && isRememberSessionEnabled()) {
    const rememberedCredentials = loadRememberedCredentials();
    if (rememberedCredentials?.email && rememberedCredentials?.password) {
      const { data: loginData, error: loginError } = await loginWithEmail(
        rememberedCredentials.email,
        rememberedCredentials.password
      );
      if (!loginError) {
        currentUser = loginData?.user ?? null;
        if (!currentUser) {
          const {
            data: { user }
          } = await supabaseClient.auth.getUser();
          currentUser = user ?? null;
        }
      }
    }
  }

  if (currentUser) {
    if (formElements.rememberMe) {
      formElements.rememberMe.checked = isRememberSessionEnabled();
    }
    setActiveSessionMarker();
    loadSavedCardsOrganization(currentUser.id);
    setAuthenticatedView(currentUser.email);
    setActiveTab(isRecoveryLinkOpened() ? 'reset' : 'editor');
    await refreshPasses();
    await refreshStats();
  } else {
    if (formElements.rememberMe) {
      formElements.rememberMe.checked = isRememberSessionEnabled();
    }
    setLoggedOutView();
    renderSavedCardsView();
  }

  supabaseClient.auth.onAuthStateChange((_event, sessionData) => {
    currentUser = sessionData?.user ?? null;
    if (currentUser) {
      setActiveSessionMarker();
      loadSavedCardsOrganization(currentUser.id);
      setAuthenticatedView(currentUser.email);
      setActiveTab(isRecoveryLinkOpened() ? 'reset' : 'editor');
      refreshPasses();
      refreshStats();
    } else {
      sessionStorage.removeItem(sessionMarkerKey);
      passFoldersById = {};
      savedFolderNames = [];
      savedCardsFilters = { folder: 'all', cardType: 'all', sort: 'newest' };
      setLoggedOutView();
      renderSavedCardsView();
    }
  });
}

function wireEvents() {
  document.getElementById('auth-form').addEventListener('submit', handleAuthSubmit);
  document.getElementById('register-btn').addEventListener('click', handleRegister);
  document.getElementById('login-btn').addEventListener('click', handleLogin);
  document.getElementById('otp-btn').addEventListener('click', handleResetOtp);
  document.getElementById('reset-btn').addEventListener('click', handleResetLinkRequest);
  document.getElementById('reset-password-form').addEventListener('submit', handleSaveNewPassword);
  document.getElementById('save-pass-btn').addEventListener('click', handleSavePass);
  document.getElementById('new-pass-btn').addEventListener('click', handleCreateNewPass);
  ui.logoutBtn.addEventListener('click', handleLogout);

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
    formElements.stampOffsetY,
    formElements.fullName,
    formElements.customerNumber,
    formElements.memberTier,
    formElements.loyaltyPoints,
    formElements.balanceValue,
    formElements.balanceCurrency,
    formElements.validUntil,
    formElements.memberSince,
    formElements.memberEmail,
    formElements.eventName,
    formElements.eventDate,
    formElements.eventTime,
    formElements.eventLocation,
    formElements.eventSection,
    formElements.eventRow,
    formElements.eventSeat,
    formElements.departure,
    formElements.destination,
    formElements.gate,
    formElements.flightNumber,
    formElements.boardingTime,
    formElements.policyName,
    formElements.coverage,
    formElements.deductible,
    formElements.coInsurance,
    formElements.barcodeType,
    formElements.barcodeValue,
    formElements.barcodeShowText,
    formElements.stampTotal,
    formElements.stampCollected,
    formElements.stampRewardText
  ];

  previewFields.filter(Boolean).forEach((field) => field.addEventListener('input', refreshPreview));
  previewFields.filter(Boolean).forEach((field) => field.addEventListener('change', refreshPreview));

  formElements.template.addEventListener('change', handleTemplateChange);
  formElements.bannerEnabled.addEventListener('change', syncBannerFields);
  formElements.bannerColor.addEventListener('change', applyBannerColorPreset);
  formElements.resetLayoutBtn?.addEventListener('click', () => {
    resetLayoutConfig();
    refreshPreview();
  });
  formElements.duplicateTemplateBtn?.addEventListener('click', () => {
    showToast('Template als Variante dupliziert (lokale Vorschau).');
  });
  onTemplateGalleryUse(({ templateId, variantId }) => {
    applyTemplatePresetFromGallery(variantId);
    formElements.template.value = templateId;
    formElements.template.dispatchEvent(new Event('change', { bubbles: true }));
  });
  formElements.previewModeHorizontal?.addEventListener('change', () => {
    if (formElements.previewModeHorizontal.checked) handlePreviewModeToggle('horizontal');
  });
  formElements.previewModeVertical?.addEventListener('change', () => {
    if (formElements.previewModeVertical.checked) handlePreviewModeToggle('vertical');
  });

  formElements.upload.addEventListener('change', handleImageUpload);
  formElements.iconUpload.addEventListener('change', handleIconUpload);
  formElements.bannerUpload.addEventListener('change', handleBannerUpload);
  formElements.addRuleBtn.addEventListener('click', handleAddNotificationRule);
  ui.notificationRules.addEventListener('click', handleRuleLocationClick);
  onSavedPassOpen(handleOpenSavedPass);
  onSavedPassScan(handleScanPass);
  onSavedPassFolderChange(handleSavedPassFolderChange);
  onSavedCardFiltersChange(handleSavedCardsFilterChange);
  onCreateFolder(handleCreateFolder);
  onSavedToolbarToggle();
  document.getElementById('export-excel-btn')?.addEventListener('click', handleExportExcel);
  ui.openWalletSimBtn?.addEventListener('click', handleOpenWalletSimulation);
  document.querySelectorAll('.tab-btn').forEach((button) =>
    button.addEventListener('click', () => setActiveTab(button.dataset.tab))
  );
  window.addEventListener('resize', updatePreviewPanePlacement);
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

  document.querySelectorAll('[data-preview-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      const selectedMode = button.dataset.previewMode === 'vertical' ? 'vertical' : 'horizontal';
      if (selectedMode === currentPreviewMode) return;
      handlePreviewModeToggle(selectedMode);
    });
  });
}

function init() {
  document.body.classList.add('logged-out');
  if (formElements.rememberMe) {
    formElements.rememberMe.checked = isRememberSessionEnabled();
  }
  initTemplateSelect();
  initSectionDropdowns();
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
  setResetTabVisibility(Boolean(appConfig.showResetTab));
  setActiveTab('editor');
  handleTemplateChange();
  setPreviewMode(getPreviewMode());
  currentPreviewMode = getPreviewMode();
  refreshPreview();
  wireEvents();
  updatePreviewPanePlacement();
  authBootstrapPromise = bootstrapAuth().finally(() => {
    authBootstrapPromise = null;
  });
}

init();
