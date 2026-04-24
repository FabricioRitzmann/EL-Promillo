import { initApi, fetchPasses, fetchPassById, upsertPass, buildPassJson } from "./api.js";
import {
  renderTemplateFields,
  renderPreviewFields,
  extractTemplateFieldValues,
  fillFormWithPass,
  passTemplates,
} from "./ui.js";

const form = document.querySelector("#pass-form");
const templateSelect = document.querySelector("#pass-template");
const templateFieldsContainer = document.querySelector("#template-fields");
const previewCard = document.querySelector("#pass-preview");
const previewOrg = document.querySelector("#preview-org");
const previewName = document.querySelector("#preview-name");
const previewDescription = document.querySelector("#preview-description");
const previewBarcode = document.querySelector("#preview-barcode");
const previewTemplateFields = document.querySelector("#preview-template-fields");
const passList = document.querySelector("#pass-list");
const exportButton = document.querySelector("#export-json");

let currentPassId = crypto.randomUUID();

function collectFormPass() {
  const data = new FormData(form);

  return {
    id: currentPassId,
    name: data.get("name")?.toString().trim() || "",
    template: data.get("template")?.toString() || "generic",
    organization_name: data.get("organizationName")?.toString().trim() || "",
    background_color: data.get("backgroundColor")?.toString() || "#0f172a",
    foreground_color: data.get("foregroundColor")?.toString() || "#f8fafc",
    label_color: data.get("labelColor")?.toString() || "#94a3b8",
    barcode_message: data.get("barcodeMessage")?.toString().trim() || "",
    description: data.get("description")?.toString().trim() || "",
  };
}

function updatePreview() {
  const pass = collectFormPass();
  const formData = new FormData(form);
  const fields = extractTemplateFieldValues(formData, pass.template);

  previewCard.style.background = pass.background_color;
  previewCard.style.color = pass.foreground_color;
  previewOrg.textContent = pass.organization_name || "Organisation";
  previewName.textContent = pass.name || "Neuer Pass";
  previewDescription.textContent = pass.description || "Hier erscheint deine Beschreibung.";
  previewBarcode.textContent = `Barcode: ${pass.barcode_message || "–"}`;

  renderPreviewFields(previewTemplateFields, pass.template, fields);
}

function downloadJsonFile(content, filename) {
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function refreshPassList() {
  const passes = await fetchPasses();
  passList.innerHTML = "";

  for (const pass of passes) {
    const li = document.createElement("li");
    const title = document.createElement("div");
    title.innerHTML = `<strong>${pass.name}</strong><div class="muted">${pass.template}</div>`;

    const openButton = document.createElement("button");
    openButton.className = "btn";
    openButton.textContent = "Laden";
    openButton.addEventListener("click", async () => {
      const details = await fetchPassById(pass.id);
      const fieldMap = Object.fromEntries((details.pass_fields || []).map((field) => [field.key, field.value]));

      currentPassId = details.id;
      fillFormWithPass(form, details);
      renderTemplateFields(templateFieldsContainer, details.template, fieldMap);
      updatePreview();
    });

    li.append(title, openButton);
    passList.appendChild(li);
  }
}

function bindEvents() {
  templateSelect.addEventListener("change", () => {
    const selectedTemplate = templateSelect.value;
    renderTemplateFields(templateFieldsContainer, selectedTemplate);
    updatePreview();
  });

  form.addEventListener("input", updatePreview);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const pass = collectFormPass();
    const formData = new FormData(form);
    const fields = extractTemplateFieldValues(formData, pass.template);

    const passId = await upsertPass(pass, fields);
    currentPassId = passId;

    await refreshPassList();
    alert("Pass wurde erfolgreich gespeichert.");
  });

  exportButton.addEventListener("click", () => {
    const pass = collectFormPass();
    const formData = new FormData(form);
    const fields = extractTemplateFieldValues(formData, pass.template);
    const json = buildPassJson(pass, fields);

    downloadJsonFile(json, `${pass.name || "wallet-pass"}.json`);
  });
}

async function start() {
  await initApi();
  renderTemplateFields(templateFieldsContainer, templateSelect.value);
  bindEvents();
  updatePreview();
  await refreshPassList();

  if (!passTemplates[templateSelect.value]) {
    templateSelect.value = "generic";
    renderTemplateFields(templateFieldsContainer, "generic");
  }
}

start().catch((error) => {
  console.error(error);
  alert(`Fehler beim Starten der App: ${error.message}`);
});
