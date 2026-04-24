export const passTemplates = {
  generic: [
    { key: "primary_title", label: "Titel" },
    { key: "secondary_info", label: "Untertitel" },
    { key: "aux_info", label: "Zusatzinfo" },
  ],
  boardingPass: [
    { key: "flight_number", label: "Flugnummer" },
    { key: "from", label: "Von" },
    { key: "to", label: "Nach" },
    { key: "seat", label: "Sitzplatz" },
    { key: "gate", label: "Gate" },
    { key: "boarding_time", label: "Boarding" },
  ],
  eventTicket: [
    { key: "event_name", label: "Event" },
    { key: "venue", label: "Location" },
    { key: "event_date", label: "Datum" },
    { key: "section", label: "Block" },
    { key: "row", label: "Reihe" },
    { key: "seat", label: "Sitz" },
  ],
  coupon: [
    { key: "offer", label: "Angebot" },
    { key: "code", label: "Code" },
    { key: "valid_until", label: "Gültig bis" },
    { key: "terms", label: "Bedingungen" },
  ],
  storeCard: [
    { key: "card_number", label: "Kartennummer" },
    { key: "member_name", label: "Mitglied" },
    { key: "points", label: "Punkte" },
    { key: "tier", label: "Status" },
  ],
};

export function renderTemplateFields(container, templateName, existingValues = {}) {
  container.innerHTML = "";

  for (const field of passTemplates[templateName] || []) {
    const wrapper = document.createElement("div");
    wrapper.className = "form-group";

    const label = document.createElement("label");
    label.textContent = field.label;
    label.setAttribute("for", `field-${field.key}`);

    const input = document.createElement("input");
    input.type = "text";
    input.id = `field-${field.key}`;
    input.name = `field_${field.key}`;
    input.value = existingValues[field.key] || "";

    wrapper.append(label, input);
    container.appendChild(wrapper);
  }
}

export function renderPreviewFields(container, templateName, values) {
  container.innerHTML = "";

  for (const field of passTemplates[templateName] || []) {
    const row = document.createElement("div");
    row.className = "preview-field";

    const label = document.createElement("span");
    label.className = "pass-label";
    label.textContent = field.label;

    const value = document.createElement("strong");
    value.textContent = values[field.key] || "–";

    row.append(label, value);
    container.appendChild(row);
  }
}

export function extractTemplateFieldValues(formData, templateName) {
  const values = {};

  for (const field of passTemplates[templateName] || []) {
    const value = formData.get(`field_${field.key}`);
    values[field.key] = value ? value.toString().trim() : "";
  }

  return values;
}

export function fillFormWithPass(form, pass) {
  form.elements["name"].value = pass.name;
  form.elements["template"].value = pass.template;
  form.elements["organizationName"].value = pass.organization_name;
  form.elements["backgroundColor"].value = pass.background_color;
  form.elements["foregroundColor"].value = pass.foreground_color;
  form.elements["labelColor"].value = pass.label_color;
  form.elements["barcodeMessage"].value = pass.barcode_message || "";
  form.elements["description"].value = pass.description || "";
}
