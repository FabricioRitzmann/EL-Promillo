import {
  completePass,
  deletePass,
  listBusinessScanStats,
  listPasses,
  loginWithEmail,
  logout,
  registerWithEmail,
  requestOtpLogin,
  requestPasswordOtp,
  savePass,
  supabaseClient,
  undoCompletePass,
  uploadCustomImage
} from './api.js';
import { appConfig } from './config.js';
import { extractPalette } from '../src/lib/wallet/extractLogoColors.js';
import { applyLogoTheme } from '../src/lib/wallet/applyLogoTheme.js';
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
  onSavedPassComplete,
  onSavedPassDelete,
  onSavedPassScan,
  renderStats,
  renderProgramFields,
  renderSavedPasses,
  resetNotificationRules,
  setActiveTab,
  setAuthenticatedView,
  setLoggedOutView,
  showToast,
  syncBannerFields,
  ui,
  updatePreview,
} from './ui.js';

let currentUser = null;
let latestAccountPassword = '';
let currentUploadedImageUrl = '';
let currentUploadedIconUrl = '';
let currentUploadedBannerUrl = '';
let currentAccountLogoUrl = '';
let currentEditingPassId = null;
let cachedLogoPalette = null;
let previousManualColors = null;
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

const COMPLETED_CARDS_FOLDER = 'Abgeschlossene Karten';
function normalizeEmail(rawEmail) {
  return (rawEmail || '').trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function randomDigits(length) {
  let result = '';
  for (let index = 0; index < length; index += 1) {
    result += String(Math.floor(Math.random() * 10));
  }
  return result;
}

function calculateModulo10CheckDigit(numberString) {
  let sum = 0;
  let multiplier = 3;
  for (let index = numberString.length - 1; index >= 0; index -= 1) {
    sum += Number(numberString[index]) * multiplier;
    multiplier = multiplier === 3 ? 1 : 3;
  }
  return String((10 - (sum % 10)) % 10);
}

function generateBarcodeValueByType(type) {
  const normalizedType = String(type || 'QR').toUpperCase();
  const randomToken = Math.random().toString(36).slice(2, 10).toUpperCase();

  switch (normalizedType) {
    case 'EAN_13': {
      const base = randomDigits(12);
      return `${base}${calculateModulo10CheckDigit(base)}`;
    }
    case 'EAN_8': {
      const base = randomDigits(7);
      return `${base}${calculateModulo10CheckDigit(base)}`;
    }
    case 'UPC_A': {
      const base = randomDigits(11);
      return `${base}${calculateModulo10CheckDigit(base)}`;
    }
    case 'UPC_E': {
      return `${randomDigits(6)}${Math.floor(Math.random() * 10)}`;
    }
    case 'CODE_39':
      return `CODE39-${randomToken}`;
    case 'CODE_93':
    case 'CODE128':
      return `SCAN-${Date.now()}-${randomToken}`;
    case 'DATA_MATRIX':
    case 'PDF417':
    case 'AZTEC':
      return `DM-${randomToken}-${Date.now()}`;
    case 'QR':
      return `https://scan.el-promillo.local/checkin/${randomToken}`;
    default:
      return '';
  }
}

function handleBarcodeTypeChange() {
  const selectedType = formElements.barcodeType?.value || 'QR';
  const generatedValue = generateBarcodeValueByType(selectedType);
  if (generatedValue) {
    formElements.qrContent.value = generatedValue;
  }
  refreshPreview();
  const typeLabel = selectedType === 'none' ? 'Kein Code' : selectedType;
  showToast(`Barcode-Typ aktiv: ${typeLabel}${generatedValue ? ' • Zufallswert generiert' : ''}`);
}

async function askEmailConfirmation({ type, email }) {
  const modal = document.getElementById('email-confirm-modal');
  const title = document.getElementById('email-confirm-title');
  const message = document.getElementById('email-confirm-message');
  const preview = document.getElementById('email-confirm-preview');
  const inputWrap = document.getElementById('email-confirm-edit-wrap');
  const input = document.getElementById('email-confirm-input');
  const error = document.getElementById('email-confirm-error');
  const cancelBtn = document.getElementById('email-confirm-cancel-btn');
  const editBtn = document.getElementById('email-confirm-edit-btn');
  const okBtn = document.getElementById('email-confirm-ok-btn');
  let currentEmail = normalizeEmail(email);
  const isOtp = type === 'otp';
  title.textContent = isOtp ? 'Login-Link senden?' : 'Passwort zurücksetzen?';
  message.textContent = isOtp
    ? 'Soll der Login-Link an diese E-Mail-Adresse gesendet werden?'
    : 'Soll der Link zum Zurücksetzen des Passworts an diese E-Mail-Adresse gesendet werden?';
  preview.textContent = currentEmail;
  input.value = currentEmail;
  inputWrap.classList.add('hidden');
  error.classList.add('hidden');
  okBtn.disabled = !isValidEmail(currentEmail);
  modal.classList.remove('hidden');
  return await new Promise((resolve) => {
    const validate = () => {
      currentEmail = normalizeEmail(input.value);
      const valid = isValidEmail(currentEmail);
      okBtn.disabled = !valid;
      error.textContent = valid ? '' : 'Bitte überprüfe die E-Mail-Adresse.';
      error.classList.toggle('hidden', valid);
      preview.textContent = currentEmail || '–';
    };
    const cleanup = (result) => {
      modal.classList.add('hidden');
      cancelBtn.onclick = null;
      editBtn.onclick = null;
      okBtn.onclick = null;
      input.oninput = null;
      resolve(result);
    };
    cancelBtn.onclick = () => cleanup(null);
    editBtn.onclick = () => inputWrap.classList.remove('hidden');
    okBtn.onclick = () => cleanup(isValidEmail(currentEmail) ? currentEmail : null);
    input.oninput = validate;
  });
}

function buildAppleWalletScanUrl(passId) {
  if (!appConfig.passkitServiceUrl || !passId) return '';
  const normalizedBaseUrl = appConfig.passkitServiceUrl.replace(/\/+$/, '');
  return `${normalizedBaseUrl}/passes/${passId}/apple`;
}

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

function storageKeyForBusinessCategory(userId) {
  return `passStudio.businessCategory.${userId}`;
}

function storageKeyForBusinessCategories(userId) {
  return `passStudio.businessCategories.${userId}`;
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

function loadBusinessCategory(userId) {
  if (!formElements.businessCategory) return;

  if (!userId) {
    formElements.businessCategory.value = 'restaurant';
    return;
  }

  const storedBusinessCategory = localStorage.getItem(storageKeyForBusinessCategory(userId));
  formElements.businessCategory.value = storedBusinessCategory || 'restaurant';
}

function appendBusinessCategoryOption(value, label = value) {
  if (!formElements.businessCategory || !value) return;
  const exists = Array.from(formElements.businessCategory.options).some((option) => option.value === value);
  if (exists) return;
  formElements.businessCategory.add(new Option(label, value));
}

function normalizeBusinessCategoryLabel(value) {
  return value.trim().replace(/\s+/g, ' ');
}

function saveBusinessCategories(userId, categories) {
  if (!userId) return;
  localStorage.setItem(storageKeyForBusinessCategories(userId), JSON.stringify(categories));
}

function loadBusinessCategories(userId) {
  if (!formElements.businessCategory || !userId) return;
  const storedCategories = localStorage.getItem(storageKeyForBusinessCategories(userId));
  if (!storedCategories) return;

  try {
    const parsed = JSON.parse(storedCategories);
    if (!Array.isArray(parsed)) return;
    parsed.forEach((category) => appendBusinessCategoryOption(category, category));
  } catch {
    localStorage.removeItem(storageKeyForBusinessCategories(userId));
  }
}

function persistBusinessCategory(userId, businessCategory) {
  if (!userId || !businessCategory) return;
  localStorage.setItem(storageKeyForBusinessCategory(userId), businessCategory);
}

function syncAccountPopupFields() {
  if (ui.accountEmail) {
    ui.accountEmail.value = currentUser?.email || formElements.email.value.trim();
  }

  if (ui.accountPassword) {
    const typedPassword = formElements.password.value.trim();
    if (typedPassword) {
      latestAccountPassword = typedPassword;
    }

    ui.accountPassword.value = latestAccountPassword;
    ui.accountPassword.placeholder = latestAccountPassword ? '' : 'Nicht gespeichert';
  }
}

function setAccountPasswordVisibility(isVisible) {
  if (!ui.accountPassword) return;

  ui.accountPassword.type = isVisible ? 'text' : 'password';

  if (ui.accountPasswordToggle) {
    ui.accountPasswordToggle.setAttribute('aria-pressed', String(isVisible));
    ui.accountPasswordToggle.setAttribute('aria-label', isVisible ? 'Passwort verbergen' : 'Passwort anzeigen');
  }
}

function openAccountPopup() {
  syncAccountPopupFields();
  setAccountPasswordVisibility(false);
  ui.accountPopup?.classList.remove('hidden');
}

function closeAccountPopup() {
  setAccountPasswordVisibility(false);
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
  syncPreviewModeTabs();
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
  const selectedMode = formElements.previewMode?.value || 'horizontal';
  document.querySelectorAll('[data-preview-mode-tab]').forEach((button) => {
    const isActive = button.dataset.previewModeTab === selectedMode;
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

async function refreshStats() {
  if (!currentUser) return;
  const { data, error } = await listBusinessScanStats(currentUser.id);
  if (error) {
    showToast(error.friendlyMessage || `Statistik konnte nicht geladen werden: ${error.message}`, true);
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
  const password = formElements.password.value;
  latestAccountPassword = password.trim();

  const { data, error } = await registerWithEmail(email, password);
  if (error) {
    showToast(`Registrierung fehlgeschlagen: ${error.message}`, true);
    return;
  }

  const registeredUser = data?.user ?? null;
  const activeSessionUser = data?.session?.user ?? null;
  currentUser = activeSessionUser || registeredUser;

  if (!currentUser) {
    setLoggedOutView();
    showToast('Registrierung erfolgreich. Bitte bestätige deine E-Mail und logge dich danach ein.');
    return;
  }

  loadSavedCardsOrganization(currentUser.id);
  loadAccountLogo(currentUser.id);
  loadBusinessCategory(currentUser.id);
  setAuthenticatedView(currentUser.email || email);
  syncAccountPopupFields();
  syncHeaderCompanyLogo();
  showToast('Registrierung erfolgreich. Du bist jetzt eingeloggt.');
  await refreshPasses();
  await refreshStats();
}

async function handleLogin() {
  const email = formElements.email.value.trim();
  const password = formElements.password.value;
  latestAccountPassword = password.trim();

  const { data, error } = await loginWithEmail(email, password);
  if (error) {
    showToast(`Login fehlgeschlagen: ${error.message}`, true);
    return;
  }

  currentUser = data.user;
  loadSavedCardsOrganization(currentUser.id);
  loadAccountLogo(currentUser.id);
  loadBusinessCategory(currentUser.id);
  setAuthenticatedView(currentUser.email);
  syncAccountPopupFields();
  syncHeaderCompanyLogo();
  showToast('Login erfolgreich.');
  await refreshPasses();
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  await handleLogin();
}

async function handleResetOtp() {
  const email = normalizeEmail(formElements.email.value);
  if (!isValidEmail(email)) {
    showToast('Bitte gib eine gültige E-Mail-Adresse ein.', true);
    return;
  }
  const confirmedEmail = await askEmailConfirmation({ type: 'passwordReset', email });
  if (!confirmedEmail) return;
  showToast('Reset-Link wird gesendet ...');
  const { error } = await requestPasswordOtp(confirmedEmail);
  if (error) {
    showToast('Der Link konnte nicht gesendet werden. Bitte versuche es später erneut.', true);
    return;
  }
  showToast('Falls ein Konto mit dieser E-Mail-Adresse existiert, wurde ein Link zum Zurücksetzen des Passworts gesendet. Der Link ist 15 Minuten gültig.');
}

async function handleOtpLogin() {
  const email = normalizeEmail(formElements.email.value);
  if (!isValidEmail(email)) {
    showToast('Bitte gib eine gültige E-Mail-Adresse ein.', true);
    return;
  }
  const confirmedEmail = await askEmailConfirmation({ type: 'otp', email });
  if (!confirmedEmail) return;
  showToast('Login-Link wird gesendet ...');
  const { error } = await requestOtpLogin(confirmedEmail);
  if (error) {
    showToast('Der Link konnte nicht gesendet werden. Bitte versuche es später erneut.', true);
    return;
  }
  showToast('Falls ein Konto mit dieser E-Mail-Adresse existiert, wurde ein Login-Link gesendet. Der Link ist 15 Minuten gültig.');
}

async function handleLogout() {
  const { error } = await logout();
  if (error) {
    showToast(`Logout fehlgeschlagen: ${error.message}`, true);
    return;
  }

  currentUser = null;
  currentUploadedImageUrl = '';
  currentUploadedIconUrl = '';
  currentUploadedBannerUrl = '';
  currentAccountLogoUrl = '';
  loadBusinessCategory(null);
  currentEditingPassId = null;
  passFoldersById = {};
  savedFolderNames = [];
  savedCardsFilters = { folder: 'all', cardType: 'all', sort: 'newest' };
  renderSavedCardsView();
  setLoggedOutView();
  closeAccountPopup();
  syncAccountPopupFields();
  syncHeaderCompanyLogo();
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
  const localLogoUrl = URL.createObjectURL(file);
  try {
    cachedLogoPalette = await extractPalette(localLogoUrl);
  } catch (error) {
    cachedLogoPalette = null;
  } finally {
    URL.revokeObjectURL(localLogoUrl);
  }

  const { data, error } = await uploadCustomImage(file, currentUser.id);
  if (error) {
    showToast(`Logo-Upload fehlgeschlagen: ${error.message}`, true);
    return;
  }
  currentAccountLogoUrl = data.publicUrl;
  persistAccountLogo(currentUser.id, currentAccountLogoUrl);
  syncHeaderCompanyLogo();
  await applyAnalyzedLogoTheme();
  showToast('Firmenlogo gespeichert und wird jetzt automatisch auf allen Karten verwendet.');
}


async function analyzeLogoPalette(force = false) {
  if (!currentAccountLogoUrl) return null;
  if (cachedLogoPalette && !force) return cachedLogoPalette;
  try {
    cachedLogoPalette = await extractPalette(currentAccountLogoUrl);
    return cachedLogoPalette;
  } catch (error) {
    showToast('Logo-Farbanalyse fehlgeschlagen. Bestehende Farben bleiben erhalten.', true);
    return null;
  }
}

async function applyAnalyzedLogoTheme() {
  const palette = await analyzeLogoPalette();
  if (!palette) return;
  if (!previousManualColors) {
    previousManualColors = { backgroundColor: formElements.bg.value, foregroundColor: formElements.fg.value, backgroundTemplateId: formElements.backgroundTemplate.value };
  }
  const themed = applyLogoTheme(
    { backgroundColor: formElements.bg.value, foregroundColor: formElements.fg.value, labelColor: formElements.passkitLabelColor.value },
    palette,
    { autoText: formElements.logoThemeAutoText.checked, autoSecondary: formElements.logoThemeAutoSecondary.checked }
  );
  if (formElements.logoThemeAutoBackground.checked) {
    formElements.bg.value = themed.backgroundColor || formElements.bg.value;
    formElements.passkitBackgroundColor.value = themed.backgroundColor || formElements.passkitBackgroundColor.value;
    if (formElements.backgroundTemplate) {
      formElements.backgroundTemplate.value = 'custom';
    }
  }
  if (formElements.logoThemeAutoText.checked) {
    formElements.fg.value = themed.foregroundColor || formElements.fg.value;
    formElements.passkitForegroundColor.value = themed.foregroundColor || formElements.passkitForegroundColor.value;
    formElements.passkitLabelColor.value = themed.labelColor || formElements.passkitLabelColor.value;
  }
  refreshPreview();
}

function resetLogoThemeColors() {
  if (!previousManualColors) return;
  formElements.bg.value = previousManualColors.backgroundColor;
  formElements.fg.value = previousManualColors.foregroundColor;
  formElements.passkitBackgroundColor.value = previousManualColors.backgroundColor;
  if (previousManualColors.backgroundTemplateId && formElements.backgroundTemplate) {
    formElements.backgroundTemplate.value = previousManualColors.backgroundTemplateId;
  }
  formElements.passkitForegroundColor.value = previousManualColors.foregroundColor;
  refreshPreview();
}

function handleBusinessCategoryChange() {
  if (!currentUser || !formElements.businessCategory) return;
  persistBusinessCategory(currentUser.id, formElements.businessCategory.value);
  refreshPreview();
}

function handleAddBusinessCategory() {
  ui.addBusinessCategoryPanel?.classList.remove('hidden');
  ui.newBusinessCategoryInput?.focus();
}

function confirmNewBusinessCategory() {
  if (!currentUser || !formElements.businessCategory || !ui.newBusinessCategoryInput) return;

  const newCategory = normalizeBusinessCategoryLabel(ui.newBusinessCategoryInput.value);
  if (!newCategory) return;

  appendBusinessCategoryOption(newCategory, newCategory);
  formElements.businessCategory.value = newCategory;
  persistBusinessCategory(currentUser.id, newCategory);

  const defaultCategories = ['restaurant', 'bar', 'club', 'cafe', 'bakery', 'other'];
  const customCategories = Array.from(formElements.businessCategory.options)
    .map((option) => option.value)
    .filter((value) => !defaultCategories.includes(value));
  saveBusinessCategories(currentUser.id, customCategories);

  ui.newBusinessCategoryInput.value = '';
  ui.addBusinessCategoryPanel?.classList.add('hidden');
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

  const { data, error } = await savePass(
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

  if (passData.passkitConfig?.enabled && appConfig.passkitServiceUrl) {
    const insertedId = Array.isArray(data) && data.length ? data[0].id : null;
    const savedEntry = latestPassEntries.find((entry) => entry.id === currentEditingPassId || entry.id === insertedId);
    const effectivePassId = currentEditingPassId || insertedId || savedEntry?.id || '';
    const scanUrl = buildAppleWalletScanUrl(effectivePassId);
    if (scanUrl) {
      formElements.qrContent.value = scanUrl;
      refreshPreview();
      showToast('QR-Code wurde auf Apple Wallet Scan-Link gesetzt.');
    }
  }
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
  currentUploadedIconUrl = selectedPass.custom_icon_url || '';
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
  if (selectedPass.card_program_type === 'streak') {
    const currentValueRaw =
      selectedPass.program_config?.currentStreak ??
      selectedPass.program_config?.streakCount ??
      selectedPass.program_config?.streak_count ??
      selectedPass.program_config?.current_value ??
      selectedPass.program_config?.progress ??
      selectedPass.program_config?.scan_count ??
      selectedPass.program_config?.currentStamps ??
      0;
    const currentValue = Number(currentValueRaw);
    const normalizedCurrent = Number.isFinite(currentValue) && currentValue >= 0 ? Math.floor(currentValue) : 0;
    const nextValue = normalizedCurrent + 1;
    const updatedPayload = {
      id: selectedPass.id,
      title: selectedPass.title || '',
      subtitle: selectedPass.subtitle || '',
      description: selectedPass.description || '',
      qrContent: selectedPass.qr_content || '',
      businessName: selectedPass.business_name || '',
      businessCategory: selectedPass.business_category || 'restaurant',
      templateId: selectedPass.template_id || 'generic',
      iconId: selectedPass.icon_id || 'coffee',
      backgroundTemplateId: selectedPass.background_template_id || 'sunset',
      backgroundColor: selectedPass.background_color || '#1f2937',
      foregroundColor: selectedPass.foreground_color || '#ffffff',
      customImageUrl: selectedPass.custom_image_url || '',
      customIconUrl: selectedPass.custom_icon_url || '',
      customBannerUrl: selectedPass.custom_banner_url || '',
      banner: {
        enabled: selectedPass.banner_enabled ?? false,
        text: selectedPass.banner_text || '',
        preset: selectedPass.banner_preset || '',
        backgroundColor: selectedPass.banner_background_color || '#000000',
        textColor: selectedPass.banner_text_color || '#ffffff',
        shape: selectedPass.banner_shape || 'pill',
        width: selectedPass.banner_width ?? 60,
        height: selectedPass.banner_height ?? 42,
        positionX: selectedPass.banner_position_x ?? 4,
        positionY: selectedPass.banner_position_y ?? 4
      },
      cardProgramType: selectedPass.card_program_type || 'generic',
      programConfig: { ...(selectedPass.program_config || {}), currentStamps: nextValue, currentStreak: nextValue },
      pushEnabled: selectedPass.push_enabled ?? false,
      notificationRules: selectedPass.notification_rules || [],
      passkitConfig: selectedPass.passkit_config || {}
    };
    const { error } = await savePass(updatedPayload, currentUser.id);
    if (error) {
      showToast(`Streak konnte nicht erhöht werden: ${error.message}`, true);
      return;
    }
    showToast(`Streak erhöht: ${nextValue}`);
    await refreshPasses();
    await refreshStats();
    return;
  }
  await askForConfirmation({
    title: 'Basiskarte kann nicht direkt gescannt werden',
    message:
      'Diese Karte ist eine Vorlage. Scans müssen über den ausgegebenen QR-Code auf einer persönlichen Kundenkarte erfolgen.',
    confirmLabel: 'Verstanden'
  });
}

async function handleCompletePass(passId) {
  const selectedPass = latestPassEntries.find((entry) => entry.id === passId);
  if (!selectedPass) return;

  const isCompleted = selectedPass.is_completed === true;
  const confirmed = await askForConfirmation({
    title: isCompleted ? 'Abschluss rückgängig machen?' : 'Karte abschließen?',
    message: isCompleted
      ? 'Die Karte wird wieder geöffnet und aus Abschlusswerten entfernt.'
      : 'Der Abschluss wird mit aktuellem Fortschritt gespeichert.',
    confirmLabel: isCompleted ? 'Rückgängig machen' : 'Abschließen'
  });
  if (!confirmed) return;

  const { error } = isCompleted
    ? await undoCompletePass({ passId: selectedPass.id, userId: currentUser.id })
    : await completePass({ pass: selectedPass, userId: currentUser.id });

  if (error) {
    showToast(
      isCompleted
        ? `Abschluss konnte nicht rückgängig gemacht werden: ${error.message}`
        : `Karte konnte nicht abgeschlossen werden: ${error.message}`,
      true
    );
    return;
  }

  if (!isCompleted && !savedFolderNames.includes(COMPLETED_CARDS_FOLDER)) {
    savedFolderNames = [...savedFolderNames, COMPLETED_CARDS_FOLDER].sort((a, b) => a.localeCompare(b, 'de-DE', { sensitivity: 'base' }));
  }

  if (isCompleted) {
    delete passFoldersById[selectedPass.id];
  } else {
    passFoldersById[selectedPass.id] = COMPLETED_CARDS_FOLDER;
  }

  persistSavedCardsOrganization();
  await refreshPasses();
  showToast(isCompleted ? 'Abschluss wurde rückgängig gemacht.' : 'Karte wurde abgeschlossen.');
  await refreshStats();
}

async function handleDeletePass(passId) {
  const selectedPass = latestPassEntries.find((entry) => entry.id === passId);
  if (!selectedPass) return;

  const confirmed = await askForConfirmation({
    title: 'Karte löschen?',
    message: `Die Karte „${selectedPass.title || 'Ohne Titel'}“ wird dauerhaft gelöscht.`,
    confirmLabel: 'Löschen'
  });
  if (!confirmed) return;

  const { error } = await deletePass(selectedPass.id, currentUser.id);
  if (error) {
    showToast(`Karte konnte nicht gelöscht werden: ${error.message}`, true);
    return;
  }

  delete passFoldersById[selectedPass.id];
  persistSavedCardsOrganization();
  showToast('Karte wurde gelöscht.');
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
    loadBusinessCategories(currentUser.id);
    loadBusinessCategory(currentUser.id);
    setAuthenticatedView(currentUser.email);
    syncHeaderCompanyLogo();
    setActiveTab('editor');
    await refreshPasses();
    await refreshStats();
  } else {
    currentAccountLogoUrl = '';
    loadBusinessCategory(null);
    setLoggedOutView();
    syncHeaderCompanyLogo();
    renderSavedCardsView();
  }

  supabaseClient.auth.onAuthStateChange((_event, sessionData) => {
    currentUser = sessionData?.user ?? null;
    if (currentUser) {
      loadSavedCardsOrganization(currentUser.id);
      loadAccountLogo(currentUser.id);
      loadBusinessCategories(currentUser.id);
      loadBusinessCategory(currentUser.id);
      setAuthenticatedView(currentUser.email);
      syncHeaderCompanyLogo();
      setActiveTab('editor');
      refreshPasses();
      refreshStats();
    } else {
      currentAccountLogoUrl = '';
      loadBusinessCategory(null);
      passFoldersById = {};
      savedFolderNames = [];
      savedCardsFilters = { folder: 'all', cardType: 'all', sort: 'newest' };
      setLoggedOutView();
      syncHeaderCompanyLogo();
      renderSavedCardsView();
    }
  });
}

function wireEvents() {
  document.getElementById('auth-form').addEventListener('submit', handleAuthSubmit);
  document.getElementById('register-btn').addEventListener('click', handleRegister);
  document.getElementById('login-btn').addEventListener('click', handleLogin);
  document.getElementById('otp-btn').addEventListener('click', handleOtpLogin);
  document.getElementById('reset-btn').addEventListener('click', handleResetOtp);
  document.getElementById('save-pass-btn').addEventListener('click', handleSavePass);
  document.getElementById('new-pass-btn').addEventListener('click', handleCreateNewPass);
  ui.logoutBtn.addEventListener('click', handleLogout);
  ui.accountBtn?.addEventListener('click', openAccountPopup);
  ui.accountPopupCloseBtn?.addEventListener('click', closeAccountPopup);
  ui.accountPasswordToggle?.addEventListener('click', () => {
    const isCurrentlyVisible = ui.accountPassword?.type === 'text';
    setAccountPasswordVisibility(!isCurrentlyVisible);
  });

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
    formElements.previewMode,
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
    formElements.useCompanyLogoForStamps
  ];

  previewFields.forEach((field) => field.addEventListener('input', refreshPreview));
  previewFields.forEach((field) => field.addEventListener('change', refreshPreview));

  formElements.template.addEventListener('change', handleTemplateChange);
  formElements.barcodeType.addEventListener('change', handleBarcodeTypeChange);
  formElements.bannerEnabled.addEventListener('change', syncBannerFields);
  formElements.bannerColor.addEventListener('change', applyBannerColorPreset);

  formElements.upload.addEventListener('change', handleImageUpload);
  formElements.accountLogoUpload?.addEventListener('change', handleAccountLogoUpload);
  formElements.logoThemeAnalyzeBtn?.addEventListener('click', async () => { await analyzeLogoPalette(true); showToast('Logo-Farben wurden analysiert.'); });
  formElements.logoThemeApplyBtn?.addEventListener('click', applyAnalyzedLogoTheme);
  formElements.logoThemeResetBtn?.addEventListener('click', resetLogoThemeColors);
  formElements.businessCategory?.addEventListener('change', handleBusinessCategoryChange);
  ui.addBusinessCategoryBtn?.addEventListener('click', handleAddBusinessCategory);
  ui.confirmBusinessCategoryBtn?.addEventListener('click', confirmNewBusinessCategory);
  ui.newBusinessCategoryInput?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    confirmNewBusinessCategory();
  });
  formElements.bannerUpload.addEventListener('change', handleBannerUpload);
  formElements.addRuleBtn.addEventListener('click', handleAddNotificationRule);
  ui.notificationRules.addEventListener('click', handleRuleLocationClick);
  onSavedPassOpen(handleOpenSavedPass);
  onSavedPassComplete(handleCompletePass);
  onSavedPassDelete(handleDeletePass);
  onSavedPassScan(handleScanPass);
  onSavedPassFolderChange(handleSavedPassFolderChange);
  onSavedCardFiltersChange(handleSavedCardsFilterChange);
  onCreateFolder(handleCreateFolder);
  onSavedToolbarToggle();
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

  document.querySelectorAll('[data-preview-mode-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      const selectedMode = button.dataset.previewModeTab;
      if (!selectedMode || formElements.previewMode.value === selectedMode) {
        return;
      }

      formElements.previewMode.value = selectedMode;
      formElements.previewMode.dispatchEvent(new Event('change', { bubbles: true }));
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
