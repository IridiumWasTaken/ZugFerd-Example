const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const profileMap = {
  basic: {
    label: 'Factur-X BASIC',
    xmlId: 'urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:basic',
  },
  basicwl: {
    label: 'Factur-X BASIC WL',
    xmlId: 'urn:factur-x.eu:1p0:basicwl',
  },
  en16931: {
    label: 'EN 16931 / ZUGFeRD',
    xmlId: 'urn:cen.eu:en16931:2017',
  },
  xrechnung: {
    label: 'XRechnung',
    xmlId: 'urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0',
  },
};

const paymentMethodMap = {
  '10': 'Barzahlung',
  '20': 'Scheck',
  '30': 'Überweisung',
  '48': 'Bankkarte',
  '49': 'Lastschrift',
  '54': 'Kreditkarte',
  '55': 'Debitkarte',
  '57': 'Vereinbarte Zahlungsart',
  '58': 'SEPA-Überweisung',
  '59': 'SEPA-Lastschrift',
  '68': 'Online-Zahlungsdienst',
};

const profileGuidance = {
  basic: {
    title: 'Factur-X BASIC',
    description: 'Minimaler Factur-X-Export mit reduziertem Umfang. Gut geeignet für einfache technische Tests mit begrenzten Pflichtfeldern.',
  },
  basicwl: {
    title: 'Factur-X BASIC WL',
    description: 'Factur-X BASIC mit erweiterten Liefer-/Zahlungsdaten. Das BASIC-WL-XML enthält keine Rechnungspositionen und daher auch keine Artikelnummern.',
  },
  en16931: {
    title: 'EN 16931 / ZUGFeRD',
    description: 'Breit kompatibel und gut für allgemeine ZUGFeRD-Tests geeignet. Für XRechnung gelten zusätzliche Pflichtfelder.',
  },
  xrechnung: {
    title: 'XRechnung',
    description: 'XRechnung verlangt zusätzliche Angaben zu Absenderkontakt, E-Mail, Telefon und Lastschrift/IBAN-Details. Kartenzahlungen sind hier nicht zugelassen.',
  },
};

const creditTransferMethods = new Set(['30', '58']);
const directDebitMethods = new Set(['49', '59']);
const cardPaymentMethods = new Set(['48', '54', '55']);

const defaultLines = [
  {
    itemNumber: 'SW-001',
    description: 'Software-Integrationstest für Fakturauswertung',
    quantity: '1',
    unit: 'Stk.',
    unitPrice: '1200.00',
    discount: '0',
    vat: '19',
  },
  {
    itemNumber: 'SV-002',
    description: 'Support, Anpassung und technische Validierung',
    quantity: '2',
    unit: 'Std.',
    unitPrice: '90.00',
    discount: '10',
    vat: '19',
  },
  {
    itemNumber: 'QA-003',
    description: 'Zugangsprüfung, Testdaten und Protokollierung',
    quantity: '1',
    unit: 'Paket',
    unitPrice: '250.00',
    discount: '0',
    vat: '0',
  },
];

const draftStorageKey = 'zugferd-example.invoice-draft.v1';
const defaultPersistenceNotice = 'Ihre Eingaben werden automatisch lokal in diesem Browser gespeichert.';

const state = {
  lines: structuredClone(defaultLines),
};

function setPersistenceNotice(message, isError = false) {
  const notice = document.getElementById('persistenceNotice');
  notice.textContent = message;
  if (isError) {
    notice.dataset.state = 'error';
  } else {
    delete notice.dataset.state;
  }
}

function isSavedLines(value) {
  const fields = ['description', 'quantity', 'unit', 'unitPrice', 'discount', 'vat'];
  const numericFields = ['quantity', 'unitPrice', 'discount', 'vat'];

  return Array.isArray(value)
    && value.length > 0
    && value.every((line) => line
      && typeof line === 'object'
      && fields.every((field) => typeof line[field] === 'string')
      && (line.itemNumber === undefined || typeof line.itemNumber === 'string')
      && numericFields.every((field) => line[field] === '' || Number.isFinite(Number(line[field]))));
}

function loadDraft() {
  let serializedDraft;
  try {
    serializedDraft = localStorage.getItem(draftStorageKey);
  } catch (error) {
    console.error('Der gespeicherte Rechnungsentwurf konnte nicht gelesen werden.', error);
    setPersistenceNotice('Gespeicherte Eingaben konnten nicht geladen werden. Bitte prüfen Sie die Speichereinstellungen Ihres Browsers.', true);
    return;
  }

  if (!serializedDraft) return;

  try {
    const draft = JSON.parse(serializedDraft);
    if (draft.version !== 1
      || !draft.fields
      || typeof draft.fields !== 'object'
      || Array.isArray(draft.fields)
      || !isSavedLines(draft.lines)) {
      throw new Error('Der gespeicherte Rechnungsentwurf hat ein ungültiges Format.');
    }

    for (const [field, value] of Object.entries(draft.fields)) {
      if (typeof value !== 'string') continue;
      const control = document.getElementById(field);
      if (!(control instanceof HTMLInputElement)
        && !(control instanceof HTMLSelectElement)
        && !(control instanceof HTMLTextAreaElement)) continue;
      if (control instanceof HTMLSelectElement
        && !Array.from(control.options).some((option) => option.value === value)) continue;
      control.value = value;
    }

    state.lines = draft.lines.map((line) => ({
      ...line,
      itemNumber: line.itemNumber ?? '',
    }));
  } catch (error) {
    console.error('Der gespeicherte Rechnungsentwurf konnte nicht wiederhergestellt werden.', error);
    setPersistenceNotice('Gespeicherte Eingaben konnten nicht wiederhergestellt werden. Ändern Sie ein Feld, um einen neuen Entwurf zu speichern.', true);
  }
}

function saveDraft() {
  const fields = Object.fromEntries(
    Array.from(document.querySelectorAll('input[id], select[id], textarea[id]'))
      .map((control) => [control.id, control.value]),
  );

  try {
    localStorage.setItem(draftStorageKey, JSON.stringify({
      version: 1,
      fields,
      lines: state.lines,
    }));
    setPersistenceNotice(defaultPersistenceNotice);
  } catch (error) {
    console.error('Der Rechnungsentwurf konnte nicht lokal gespeichert werden.', error);
    setPersistenceNotice('Lokales Speichern nicht möglich. Ihre Änderungen gehen beim Neuladen verloren.', true);
  }
}

function getInputValue(id) {
  return document.getElementById(id)?.value?.trim() ?? '';
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function money(value) {
  return Number(value || 0);
}

function formatTaxAmount(value) {
  return Number(value || 0).toFixed(2);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function normalizeIban(value) {
  return String(value || '').replace(/\s+/g, '').toUpperCase();
}

function isValidIban(value) {
  const iban = normalizeIban(value);
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban) || iban.length > 34) return false;

  const rearranged = `${iban.slice(4)}${iban.slice(0, 4)}`;
  let remainder = 0;
  for (const character of rearranged) {
    const digits = /[A-Z]/.test(character) ? String(character.charCodeAt(0) - 55) : character;
    for (const digit of digits) remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder === 1;
}

function updateProfileInfo() {
  const profile = document.getElementById('profileSelect').value;
  const target = profileGuidance[profile] ?? profileGuidance.en16931;
  const titleNode = document.getElementById('profileTitle');
  const descriptionNode = document.getElementById('profileDescription');

  titleNode.textContent = target.title;
  descriptionNode.textContent = target.description;
}

function updatePaymentFields() {
  const method = document.getElementById('paymentMethod').value;
  const profile = document.getElementById('profileSelect').value;
  const isDirectDebit = directDebitMethods.has(method);
  document.getElementById('paymentIbanField').hidden = !creditTransferMethods.has(method);
  document.getElementById('debtorIbanField').hidden = !isDirectDebit;
  document.getElementById('mandateReferenceField').hidden = !isDirectDebit;
  document.getElementById('creditorIdentifierField').hidden = !isDirectDebit;
  const isXRechnungCardPayment = profile === 'xrechnung' && cardPaymentMethods.has(method);
  const hint = document.getElementById('paymentMethodHint');
  hint.hidden = !isXRechnungCardPayment;
  hint.textContent = isXRechnungCardPayment
    ? 'XRechnung verlangt Kartendaten. Diese App erfasst keine Kartennummern; bitte wählen Sie eine andere Zahlungsart.'
    : '';

  if (profile === 'xrechnung') {
    document.getElementById('paymentMethodHint').textContent = `XRechnung: Zahlsysteme mit Karte sind nicht zulässig. Für ${paymentMethodMap[method] || 'diese Zahlungsart'} benötigen Sie eine andere Methode.`;
  }
}

function roundCurrency(value) {
  return Number(Number(value).toFixed(2));
}

const unitCodeMap = new Map([
  ['st.', 'H87'],
  ['stk', 'H87'],
  ['stk.', 'H87'],
  ['stück', 'H87'],
  ['stueck', 'H87'],
  ['piece', 'H87'],
  ['pc', 'H87'],
  ['pcs', 'H87'],
  ['std', 'HUR'],
  ['std.', 'HUR'],
  ['stunde', 'HUR'],
  ['stunden', 'HUR'],
  ['hour', 'HUR'],
  ['hours', 'HUR'],
  ['h', 'HUR'],
  ['tag', 'DAY'],
  ['tage', 'DAY'],
  ['day', 'DAY'],
  ['days', 'DAY'],
  ['paket', 'XPK'],
  ['pack', 'XPK'],
  ['package', 'XPK'],
  ['set', 'SET'],
  ['kg', 'KGM'],
  ['kilogramm', 'KGM'],
  ['g', 'GRM'],
  ['gramm', 'GRM'],
  ['l', 'LTR'],
  ['liter', 'LTR'],
  ['m', 'MTR'],
  ['meter', 'MTR'],
  ['m²', 'MTK'],
  ['m2', 'MTK'],
  ['m³', 'MTQ'],
  ['m3', 'MTQ'],
  ['kwh', 'KWH'],
]);

const supportedUnitCodes = new Set(unitCodeMap.values());

function getUnitCode(unit) {
  const normalizedUnit = String(unit || '').trim().toLocaleLowerCase('de-DE');
  if (supportedUnitCodes.has(normalizedUnit.toUpperCase())) {
    return normalizedUnit.toUpperCase();
  }
  return unitCodeMap.get(normalizedUnit) ?? '';
}

function formatDateForXml(date) {
  if (!date) return '';
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return '';
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function getInvoiceData() {
  return {
    profile: document.getElementById('profileSelect').value,
    invoiceNumber: getInputValue('invoiceNumber'),
    invoiceDate: getInputValue('invoiceDate'),
    dueDate: getInputValue('dueDate'),
    customerReference: getInputValue('customerReference'),
    buyerOrderNumber: getInputValue('buyerOrderNumber'),
    commission: getInputValue('commission'),
    paymentMethod: getInputValue('paymentMethod'),
    paymentIban: getInputValue('paymentIban'),
    debtorIban: getInputValue('debtorIban'),
    mandateReference: getInputValue('mandateReference'),
    creditorIdentifier: getInputValue('creditorIdentifier'),
    paymentTerms: getInputValue('paymentTerms'),
    seller: {
      name: getInputValue('sellerName'),
      street: getInputValue('sellerStreet'),
      address2: getInputValue('sellerAddress2'),
      postal: getInputValue('sellerPostal'),
      city: getInputValue('sellerCity'),
      country: getInputValue('sellerCountry'),
      vat: getInputValue('sellerVat'),
      contact: getInputValue('sellerContact'),
      contactName: getInputValue('sellerContactName'),
      phone: getInputValue('sellerPhone'),
    },
    buyer: {
      name: getInputValue('buyerName'),
      street: getInputValue('buyerStreet'),
      address2: getInputValue('buyerAddress2'),
      postal: getInputValue('buyerPostal'),
      city: getInputValue('buyerCity'),
      country: getInputValue('buyerCountry'),
      vat: getInputValue('buyerVat'),
      contact: getInputValue('buyerContact'),
    },
    lines: state.lines,
  };
}

function calculateLineAmounts(line) {
  const quantity = Number(line.quantity || 0);
  const unitPrice = Number(line.unitPrice || 0);
  const discount = Number(line.discount || 0);
  const vatRate = Number(line.vat || 0);

  const netLine = quantity * unitPrice * (1 - discount / 100);
  const vatLine = netLine * (vatRate / 100);
  const grossLine = netLine + vatLine;

  return { netLine, vatLine, grossLine };
}

function calculateTotals() {
  const lines = state.lines;

  let net = 0;
  let vat = 0;
  let gross = 0;

  lines.forEach((line) => {
    const amounts = calculateLineAmounts(line);
    net += amounts.netLine;
    vat += amounts.vatLine;
    gross += amounts.grossLine;
  });

  return { net, vat, gross };
}

function updateTotals() {
  const totals = calculateTotals();
  document.getElementById('totalNet').textContent = currencyFormatter.format(totals.net);
  document.getElementById('totalVat').textContent = currencyFormatter.format(totals.vat);
  document.getElementById('totalGross').textContent = currencyFormatter.format(totals.gross);
  document.getElementById('downloadButton').disabled = !isFormValid();
}

function updateLineRowDisplay(lineIndex) {
  const row = document.querySelector(`tr[data-index="${lineIndex}"] .line-total`);
  if (!row) return;
  const amounts = calculateLineAmounts(state.lines[lineIndex]);
  row.textContent = currencyFormatter.format(amounts.grossLine);
}

function renderLineRows() {
  const container = document.getElementById('lineRows');
  container.innerHTML = state.lines
    .map((line, index) => {
      const amounts = calculateLineAmounts(line);
      return `
        <tr data-index="${index}">
          <td><input class="table-input" data-line-index="${index}" data-field="itemNumber" aria-label="Artikelnummer für Position ${index + 1}" value="${escapeXml(line.itemNumber ?? '')}" /></td>
          <td><input class="table-input" data-line-index="${index}" data-field="description" aria-label="Beschreibung für Position ${index + 1}" value="${escapeXml(line.description)}" /></td>
          <td><input class="table-input" data-line-index="${index}" data-field="quantity" type="number" min="0" step="0.01" value="${escapeXml(line.quantity)}" /></td>
          <td><input class="table-input" data-line-index="${index}" data-field="unit" value="${escapeXml(line.unit)}" /></td>
          <td><input class="table-input" data-line-index="${index}" data-field="unitPrice" type="number" min="0" step="0.01" value="${escapeXml(line.unitPrice)}" /></td>
          <td><input class="table-input" data-line-index="${index}" data-field="discount" type="number" min="0" max="100" step="0.01" value="${escapeXml(line.discount)}" /></td>
          <td><input class="table-input" data-line-index="${index}" data-field="vat" type="number" min="0" max="100" step="0.01" value="${escapeXml(line.vat)}" /></td>
          <td><div class="line-total">${currencyFormatter.format(amounts.grossLine)}</div></td>
          <td>
            <button type="button" class="icon-button" data-remove-line="${index}" aria-label="Position löschen">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M5 7h14l-1 12.5A2.5 2.5 0 0 1 15.5 22h-7A2.5 2.5 0 0 1 6 19.5L5 7Zm3-2.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V5h2a1 1 0 1 1 0 2H6a1 1 0 1 1 0-2h2v-.5ZM10 9v8m4-8v8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </td>
        </tr>
      `;
    })
    .join('');

  updateTotals();
}

function syncLineFromInput(lineIndex, field, value) {
  const line = state.lines[lineIndex];
  if (!line) return;
  line[field] = value;
  updateLineRowDisplay(lineIndex);
  updateTotals();
}

function addLine() {
  state.lines.push({
    itemNumber: '',
    description: 'Neue Position',
    quantity: '1',
    unit: 'Stk.',
    unitPrice: '0.00',
    discount: '0',
    vat: '19',
  });
  renderLineRows();
  saveDraft();
}

function removeLine(index) {
  if (state.lines.length === 1) {
    state.lines = [
      {
        itemNumber: '',
        description: 'Neue Position',
        quantity: '1',
        unit: 'Stk.',
        unitPrice: '0.00',
        discount: '0',
        vat: '19',
      },
    ];
  } else {
    state.lines.splice(index, 1);
  }
  renderLineRows();
  saveDraft();
}

function isFormValid() {
  const invoice = getInvoiceData();
  const errors = validateInvoice(invoice);
  return errors.length === 0;
}

function showValidationErrors(errors) {
  const errorBox = document.getElementById('validationErrors');
  if (!errors.length) {
    errorBox.classList.remove('visible');
    errorBox.innerHTML = '';
    return;
  }

  errorBox.classList.add('visible');
  errorBox.innerHTML = `<ul>${errors.map((msg) => `<li>${escapeXml(msg)}</li>`).join('')}</ul>`;
}

function validateInvoice(invoice) {
  const errors = [];

  if (!invoice.invoiceNumber) errors.push('Rechnungsnummer fehlt.');
  if (!invoice.invoiceDate) errors.push('Rechnungsdatum fehlt.');
  if (!invoice.dueDate) errors.push('Fälligkeitsdatum fehlt.');
  if (!invoice.seller.name) errors.push('Absender-Unternehmen fehlt.');
  if (!invoice.buyer.name) errors.push('Empfänger-Unternehmen fehlt.');
  if (!invoice.seller.street || !invoice.seller.postal || !invoice.seller.city || !invoice.seller.country) {
    errors.push('Absender-Adresse ist unvollständig.');
  }
  if (!invoice.buyer.street || !invoice.buyer.postal || !invoice.buyer.city || !invoice.buyer.country) {
    errors.push('Empfänger-Adresse ist unvollständig.');
  }
  if (!Object.hasOwn(paymentMethodMap, invoice.paymentMethod)) errors.push('Bitte wählen Sie eine gültige Zahlungsart.');
  if (creditTransferMethods.has(invoice.paymentMethod) && !isValidIban(invoice.paymentIban)) {
    errors.push('Bitte geben Sie eine gültige IBAN des Zahlungsempfängers an.');
  }
  if (directDebitMethods.has(invoice.paymentMethod)) {
    if (!isValidIban(invoice.debtorIban)) errors.push('Bitte geben Sie eine gültige IBAN des Zahlers für die Lastschrift an.');
    if (!invoice.mandateReference) errors.push('Bitte geben Sie die Mandatsreferenz der Lastschrift an.');
    if (invoice.profile === 'xrechnung' && !invoice.creditorIdentifier) {
      errors.push('Für XRechnung muss bei Lastschrift die Gläubiger-ID des Absenders angegeben werden.');
    }
  }
  if (invoice.profile === 'xrechnung' && cardPaymentMethods.has(invoice.paymentMethod)) {
    errors.push('XRechnung verlangt bei Kartenzahlung Kartendaten. Diese App erfasst keine Kartennummern; wählen Sie bitte eine andere Zahlungsart.');
  }

  if (!invoice.lines.length) errors.push('Mindestens eine Position ist erforderlich.');

  invoice.lines.forEach((line, index) => {
    if (!line.description || !line.description.trim()) {
      errors.push(`Position ${index + 1}: Beschreibung fehlt.`);
    }
    if (!line.unit || !line.unit.trim()) {
      errors.push(`Position ${index + 1}: Einheit fehlt.`);
    } else if (!getUnitCode(line.unit)) {
      errors.push(`Position ${index + 1}: Die Einheit "${line.unit}" kann nicht als gültige UN/ECE-Einheit codiert werden.`);
    }
    if (Number(line.quantity || 0) <= 0) {
      errors.push(`Position ${index + 1}: Menge muss größer als 0 sein.`);
    }
    if (Number(line.unitPrice || 0) < 0) {
      errors.push(`Position ${index + 1}: Nettopreis darf nicht negativ sein.`);
    }
    if (Number(line.discount || 0) < 0 || Number(line.discount || 0) > 100) {
      errors.push(`Position ${index + 1}: Rabatt muss zwischen 0 und 100 % liegen.`);
    }
    if (Number(line.vat || 0) < 0 || Number(line.vat || 0) > 100) {
      errors.push(`Position ${index + 1}: Mehrwertsteuersatz muss zwischen 0 und 100 % liegen.`);
    }
  });

  if (invoice.profile === 'xrechnung') {
    if (!invoice.seller.contactName) errors.push('Für XRechnung muss eine Kontaktperson des Absenders angegeben werden.');
    if (!/\d{3}/.test(invoice.seller.phone)) errors.push('Für XRechnung muss eine Telefonnummer des Absenders mit mindestens drei Ziffern angegeben werden.');
    if (!isValidEmail(invoice.seller.contact)) errors.push('Für XRechnung muss eine gültige E-Mail-Adresse des Absenders angegeben werden.');
    if (!isValidEmail(invoice.buyer.contact)) errors.push('Für XRechnung muss eine gültige E-Mail-Adresse des Empfängers angegeben werden.');
  }

  return errors;
}

function validateAndShow() {
  const invoice = getInvoiceData();
  const errors = validateInvoice(invoice);
  showValidationErrors(errors);
  updateTotals();
}

function buildXmlInvoice(invoice) {
  const profile = profileMap[invoice.profile] ?? profileMap.en16931;
  const optionalElement = (name, value, attributes = '') => (
    String(value || '').trim()
      ? `<ram:${name}${attributes}>${escapeXml(value)}</ram:${name}>`
      : ''
  );
  const xmlLines = invoice.lines.map((line) => {
    const rate = Number(line.vat || 0);
    const amounts = calculateLineAmounts(line);
    return {
      line,
      unitCode: getUnitCode(line.unit),
      rate,
      category: rate === 0 ? 'Z' : 'S',
      net: roundCurrency(amounts.netLine),
      tax: roundCurrency(amounts.netLine * rate / 100),
      grossUnitPrice: Number(line.unitPrice || 0),
      netUnitPrice: Number(line.unitPrice || 0) * (1 - Number(line.discount || 0) / 100),
      discount: Number(line.discount || 0),
    };
  });

  const lineItems = (invoice.profile === 'basicwl' ? [] : invoice.lines)
    .map((line, index) => {
      const xmlLine = xmlLines[index];
      const discountMarkup = xmlLine.discount > 0
        ? `
            <ram:GrossPriceProductTradePrice>
              <ram:ChargeAmount>${formatTaxAmount(xmlLine.grossUnitPrice)}</ram:ChargeAmount>
              <ram:BasisQuantity unitCode="${xmlLine.unitCode}">1.0000</ram:BasisQuantity>
              <ram:AppliedTradeAllowanceCharge>
                <ram:ChargeIndicator><udt:Indicator>false</udt:Indicator></ram:ChargeIndicator>
                <ram:ActualAmount>${formatTaxAmount(xmlLine.grossUnitPrice * xmlLine.discount / 100)}</ram:ActualAmount>
                ${invoice.profile === 'xrechnung' ? '' : '<ram:Reason>Rabatt</ram:Reason>'}
              </ram:AppliedTradeAllowanceCharge>
            </ram:GrossPriceProductTradePrice>
          `
        : '';
      return `
        <ram:IncludedSupplyChainTradeLineItem>
          <ram:AssociatedDocumentLineDocument>
            <ram:LineID>${index + 1}</ram:LineID>
          </ram:AssociatedDocumentLineDocument>
          <ram:SpecifiedTradeProduct>
            ${optionalElement('SellerAssignedID', line.itemNumber)}
            <ram:Name>${escapeXml(line.description)}</ram:Name>
          </ram:SpecifiedTradeProduct>
          <ram:SpecifiedLineTradeAgreement>
            ${discountMarkup}
            <ram:NetPriceProductTradePrice>
              <ram:ChargeAmount>${formatTaxAmount(xmlLine.netUnitPrice)}</ram:ChargeAmount>
              <ram:BasisQuantity unitCode="${xmlLine.unitCode}">1.0000</ram:BasisQuantity>
            </ram:NetPriceProductTradePrice>
          </ram:SpecifiedLineTradeAgreement>
          <ram:SpecifiedLineTradeDelivery>
            <ram:BilledQuantity unitCode="${xmlLine.unitCode}">${Number(line.quantity || 0).toFixed(4)}</ram:BilledQuantity>
          </ram:SpecifiedLineTradeDelivery>
          <ram:SpecifiedLineTradeSettlement>
            <ram:ApplicableTradeTax>
              <ram:TypeCode>VAT</ram:TypeCode>
              <ram:CategoryCode>${xmlLine.category}</ram:CategoryCode>
              <ram:RateApplicablePercent>${xmlLine.rate.toFixed(2)}</ram:RateApplicablePercent>
            </ram:ApplicableTradeTax>
            <ram:SpecifiedTradeSettlementLineMonetarySummation>
              <ram:LineTotalAmount>${formatTaxAmount(xmlLine.net)}</ram:LineTotalAmount>
            </ram:SpecifiedTradeSettlementLineMonetarySummation>
          </ram:SpecifiedLineTradeSettlement>
        </ram:IncludedSupplyChainTradeLineItem>
      `;
    })
    .join('');

  const taxGroups = new Map();
  xmlLines.forEach((line) => {
    const key = `${line.category}:${line.rate.toFixed(2)}`;
    const group = taxGroups.get(key) ?? { category: line.category, rate: line.rate, basis: 0, tax: 0 };
    group.basis = roundCurrency(group.basis + line.net);
    group.tax = roundCurrency(group.tax + line.tax);
    taxGroups.set(key, group);
  });

  const taxEntries = Array.from(taxGroups.values())
    .map((values) => {
      return `
        <ram:ApplicableTradeTax>
          <ram:CalculatedAmount>${formatTaxAmount(values.tax)}</ram:CalculatedAmount>
          <ram:TypeCode>VAT</ram:TypeCode>
          <ram:BasisAmount>${formatTaxAmount(values.basis)}</ram:BasisAmount>
          <ram:CategoryCode>${values.category}</ram:CategoryCode>
          <ram:RateApplicablePercent>${values.rate.toFixed(2)}</ram:RateApplicablePercent>
        </ram:ApplicableTradeTax>
      `;
    })
    .join('');

  const totals = xmlLines.reduce((sum, line) => {
    sum.net = roundCurrency(sum.net + line.net);
    return sum;
  }, { net: 0 });
  totals.vat = roundCurrency(Array.from(taxGroups.values()).reduce((sum, group) => sum + group.tax, 0));
  totals.gross = roundCurrency(totals.net + totals.vat);

  const sellerVat = String(invoice.seller.vat || '').trim()
    ? `<ram:SpecifiedTaxRegistration><ram:ID schemeID="VA">${escapeXml(invoice.seller.vat)}</ram:ID></ram:SpecifiedTaxRegistration>`
    : '';
  const buyerVat = String(invoice.buyer.vat || '').trim()
    ? `<ram:SpecifiedTaxRegistration><ram:ID schemeID="VA">${escapeXml(invoice.buyer.vat)}</ram:ID></ram:SpecifiedTaxRegistration>`
    : '';
  const sellerAddressLineTwo = optionalElement('LineTwo', invoice.seller.address2);
  const buyerAddressLineTwo = optionalElement('LineTwo', invoice.buyer.address2);
  const sellerElectronicAddress = isValidEmail(invoice.seller.contact)
    ? `<ram:URIUniversalCommunication><ram:URIID schemeID="EM">${escapeXml(invoice.seller.contact)}</ram:URIID></ram:URIUniversalCommunication>`
    : '';
  const buyerElectronicAddress = isValidEmail(invoice.buyer.contact)
    ? `<ram:URIUniversalCommunication><ram:URIID schemeID="EM">${escapeXml(invoice.buyer.contact)}</ram:URIID></ram:URIUniversalCommunication>`
    : '';
  const buyerOrderReference = String(invoice.buyerOrderNumber || '').trim()
    ? `<ram:BuyerOrderReferencedDocument><ram:IssuerAssignedID>${escapeXml(invoice.buyerOrderNumber)}</ram:IssuerAssignedID></ram:BuyerOrderReferencedDocument>`
    : '';
  const payeeAccount = creditTransferMethods.has(invoice.paymentMethod)
    ? `<ram:PayeePartyCreditorFinancialAccount><ram:IBANID>${escapeXml(normalizeIban(invoice.paymentIban))}</ram:IBANID></ram:PayeePartyCreditorFinancialAccount>`
    : '';
  const payerAccount = directDebitMethods.has(invoice.paymentMethod)
    ? `<ram:PayerPartyDebtorFinancialAccount><ram:IBANID>${escapeXml(normalizeIban(invoice.debtorIban))}</ram:IBANID></ram:PayerPartyDebtorFinancialAccount>`
    : '';
  const creditorIdentifier = directDebitMethods.has(invoice.paymentMethod)
    ? optionalElement('CreditorReferenceID', invoice.creditorIdentifier)
    : '';
  const paymentMeans = `
      <ram:SpecifiedTradeSettlementPaymentMeans>
        <ram:TypeCode>${escapeXml(invoice.paymentMethod)}</ram:TypeCode>
        ${payeeAccount}
        ${payerAccount}
      </ram:SpecifiedTradeSettlementPaymentMeans>`;
  const directDebitMandate = directDebitMethods.has(invoice.paymentMethod)
    ? `<ram:DirectDebitMandateID>${escapeXml(invoice.mandateReference)}</ram:DirectDebitMandateID>`
    : '';
  const sellerXRechnungContact = invoice.profile === 'xrechnung'
    ? `<ram:DefinedTradeContact>
        <ram:PersonName>${escapeXml(invoice.seller.contactName)}</ram:PersonName>
        <ram:TelephoneUniversalCommunication><ram:CompleteNumber>${escapeXml(invoice.seller.phone)}</ram:CompleteNumber></ram:TelephoneUniversalCommunication>
        <ram:EmailURIUniversalCommunication><ram:URIID>${escapeXml(invoice.seller.contact)}</ram:URIID></ram:EmailURIUniversalCommunication>
      </ram:DefinedTradeContact>`
    : '';
  const businessProcessContext = invoice.profile === 'xrechnung'
    ? `<ram:BusinessProcessSpecifiedDocumentContextParameter><ram:ID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</ram:ID></ram:BusinessProcessSpecifiedDocumentContextParameter>`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice
    xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100"
    xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100"
    xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100"
    xmlns:qdt="urn:un:unece:uncefact:data:standard:QualifiedDataType:100"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <rsm:ExchangedDocumentContext>
    ${businessProcessContext}
    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>${escapeXml(profile.xmlId)}</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>
  <rsm:ExchangedDocument>
    <ram:ID>${escapeXml(invoice.invoiceNumber)}</ram:ID>
    <ram:TypeCode>380</ram:TypeCode>
    <ram:IssueDateTime>
      <udt:DateTimeString format="102">${formatDateForXml(invoice.invoiceDate)}</udt:DateTimeString>
    </ram:IssueDateTime>
  </rsm:ExchangedDocument>
  <rsm:SupplyChainTradeTransaction>
    ${lineItems}
    <ram:ApplicableHeaderTradeAgreement>
      ${optionalElement('BuyerReference', invoice.customerReference)}
      <ram:SellerTradeParty>
        <ram:Name>${escapeXml(invoice.seller.name)}</ram:Name>
        ${sellerXRechnungContact}
        <ram:PostalTradeAddress>
          <ram:PostcodeCode>${escapeXml(invoice.seller.postal)}</ram:PostcodeCode>
          <ram:LineOne>${escapeXml(invoice.seller.street)}</ram:LineOne>
          ${sellerAddressLineTwo}
          <ram:CityName>${escapeXml(invoice.seller.city)}</ram:CityName>
          <ram:CountryID>${escapeXml(invoice.seller.country)}</ram:CountryID>
        </ram:PostalTradeAddress>
        ${sellerElectronicAddress}
        ${sellerVat}
      </ram:SellerTradeParty>
      <ram:BuyerTradeParty>
        <ram:Name>${escapeXml(invoice.buyer.name)}</ram:Name>
        <ram:PostalTradeAddress>
          <ram:PostcodeCode>${escapeXml(invoice.buyer.postal)}</ram:PostcodeCode>
          <ram:LineOne>${escapeXml(invoice.buyer.street)}</ram:LineOne>
          ${buyerAddressLineTwo}
          <ram:CityName>${escapeXml(invoice.buyer.city)}</ram:CityName>
          <ram:CountryID>${escapeXml(invoice.buyer.country)}</ram:CountryID>
        </ram:PostalTradeAddress>
        ${buyerElectronicAddress}
        ${buyerVat}
      </ram:BuyerTradeParty>
      ${buyerOrderReference}
    </ram:ApplicableHeaderTradeAgreement>
    <ram:ApplicableHeaderTradeDelivery>
      <ram:ShipToTradeParty>
        <ram:Name>${escapeXml(invoice.buyer.name)}</ram:Name>
      </ram:ShipToTradeParty>
    </ram:ApplicableHeaderTradeDelivery>
    <ram:ApplicableHeaderTradeSettlement>
      ${creditorIdentifier}
      <ram:InvoiceCurrencyCode>EUR</ram:InvoiceCurrencyCode>
      ${paymentMeans}
      ${taxEntries}
      <ram:SpecifiedTradePaymentTerms>
        ${optionalElement('Description', invoice.paymentTerms)}
        <ram:DueDateDateTime>
          <udt:DateTimeString format="102">${formatDateForXml(invoice.dueDate)}</udt:DateTimeString>
        </ram:DueDateDateTime>
        ${directDebitMandate}
      </ram:SpecifiedTradePaymentTerms>
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <ram:LineTotalAmount>${formatTaxAmount(totals.net)}</ram:LineTotalAmount>
        <ram:TaxBasisTotalAmount>${formatTaxAmount(totals.net)}</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount currencyID="EUR">${formatTaxAmount(totals.vat)}</ram:TaxTotalAmount>
        <ram:GrandTotalAmount>${formatTaxAmount(totals.gross)}</ram:GrandTotalAmount>
        <ram:DuePayableAmount>${formatTaxAmount(totals.gross)}</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>`;
}

async function generatePdf(invoice, xmlContent) {
  const { PDFDocument, StandardFonts, rgb, AFRelationship } = PDFLib;
  const pdfDoc = await PDFDocument.create();
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 42;
  const contentWidth = pageWidth - margin * 2;
  const itemColumns = [
    { label: 'Artikel-Nr.', width: 72 },
    { label: 'Beschreibung', width: 130 },
    { label: 'Menge', width: 43 },
    { label: 'Preis', width: 68 },
    { label: 'Rabatt', width: 48 },
    { label: 'USt.', width: 45 },
    { label: 'Gesamt', width: 105 },
  ];

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const textColor = rgb(0.2, 0.27, 0.36);
  const mutedColor = rgb(0.42, 0.47, 0.57);
  const headingColor = rgb(0.1, 0.14, 0.2);
  const pages = [];
  let page;

  function addPage() {
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    pages.push(page);
    return page;
  }

  function wrapText(value, textFont, size, maxWidth) {
    const words = String(value || '—').split(/\s+/);
    const lines = [];
    let currentLine = '';

    words.forEach((word) => {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (textFont.widthOfTextAtSize(candidate, size) <= maxWidth) {
        currentLine = candidate;
        return;
      }

      if (currentLine) lines.push(currentLine);
      currentLine = '';

      let remaining = word;
      while (remaining && textFont.widthOfTextAtSize(remaining, size) > maxWidth) {
        let splitAt = remaining.length;
        while (splitAt > 1 && textFont.widthOfTextAtSize(remaining.slice(0, splitAt), size) > maxWidth) {
          splitAt -= 1;
        }
        lines.push(remaining.slice(0, splitAt));
        remaining = remaining.slice(splitAt);
      }
      currentLine = remaining;
    });

    if (currentLine) lines.push(currentLine);
    return lines.length ? lines : ['—'];
  }

  function drawWrapped(value, x, y, width, size, textFont = font, color = textColor, lineHeight = 12) {
    const lines = wrapText(value, textFont, size, width);
    lines.forEach((line, index) => {
      page.drawText(line, { x, y: y - index * lineHeight, size, font: textFont, color });
    });
    return y - lines.length * lineHeight;
  }

  function drawItemsHeader(y, title) {
    page.drawText(title, {
      x: margin,
      y,
      size: 12,
      font: boldFont,
      color: headingColor,
    });

    const headerY = y - 20;
    page.drawRectangle({
      x: margin,
      y: headerY - 7,
      width: contentWidth,
      height: 20,
      color: rgb(0.94, 0.96, 0.98),
    });

    let columnX = margin;
    itemColumns.forEach(({ label, width }) => {
      page.drawText(label, {
        x: columnX,
        y: headerY,
        size: 8,
        font: boldFont,
        color: mutedColor,
        maxWidth: width - 5,
      });
      columnX += width;
    });
    return headerY - 18;
  }

  addPage();
  page.drawText('Rechnung', {
    x: margin,
    y: pageHeight - 54,
    size: 22,
    font: boldFont,
    color: headingColor,
  });
  page.drawText(`ZUGFeRD / Factur-X · ${profileMap[invoice.profile]?.label ?? profileMap.en16931.label}`, {
    x: margin,
    y: pageHeight - 76,
    size: 9,
    font,
    color: mutedColor,
  });

  const columnGap = 26;
  const detailColumnWidth = (contentWidth - columnGap) / 2;
  const leftX = margin;
  const rightX = margin + detailColumnWidth + columnGap;

  function drawHeaderDetail(y, label, value) {
    page.drawText(`${label}:`, {
      x: rightX,
      y,
      size: 8,
      font,
      color: mutedColor,
    });
    const valueX = rightX + 88;
    const valueWidth = pageWidth - margin - valueX;
    const lines = wrapText(value, boldFont, 8, valueWidth);
    lines.forEach((line, index) => {
      page.drawText(line, {
        x: pageWidth - margin - boldFont.widthOfTextAtSize(line, 8),
        y: y - index * 10,
        size: 8,
        font: boldFont,
        color: textColor,
      });
    });
    return y - Math.max(15, lines.length * 10 + 3);
  }

  let headerY = pageHeight - 54;
  headerY = drawHeaderDetail(headerY, 'Rechnungsnummer', invoice.invoiceNumber);
  headerY = drawHeaderDetail(headerY, 'Rechnungsdatum', invoice.invoiceDate);
  headerY = drawHeaderDetail(headerY, 'Fälligkeitsdatum', invoice.dueDate);

  const partiesHeadingY = pageHeight - 130;
  page.drawText('Empfänger', {
    x: leftX,
    y: partiesHeadingY,
    size: 11,
    font: boldFont,
    color: headingColor,
  });
  page.drawText('Absender', {
    x: rightX,
    y: partiesHeadingY,
    size: 11,
    font: boldFont,
    color: headingColor,
  });

  function drawParty(party, x, y) {
    let currentY = y - 17;
    const lines = [
      { value: party.name, font: boldFont, size: 9 },
      { value: party.street },
      ...(party.address2 ? [{ value: party.address2 }] : []),
      { value: `${party.postal} ${party.city}` },
      { value: `${party.country} · USt-ID ${party.vat || '—'}` },
      { value: `Kontakt: ${party.contact || '—'}` },
    ];
    lines.forEach(({ value, font: lineFont = font, size = 8 }) => {
      currentY = drawWrapped(value, x, currentY, detailColumnWidth, size, lineFont, textColor, 10) - 2;
    });
    return currentY;
  }

  const buyerBottom = drawParty(invoice.buyer, leftX, partiesHeadingY);
  const sellerBottom = drawParty(invoice.seller, rightX, partiesHeadingY);
  const partiesBottom = Math.min(buyerBottom, sellerBottom);

  function drawInvoiceDetail(y, label, value) {
    page.drawText(`${label}:`, {
      x: margin,
      y,
      size: 8,
      font: boldFont,
      color: textColor,
    });
    const valueBottom = drawWrapped(value, margin + 105, y, contentWidth - 105, 8, font, textColor, 10);
    return Math.min(y - 14, valueBottom - 2);
  }

  let invoiceDetailsY = partiesBottom - 14;
  invoiceDetailsY = drawInvoiceDetail(invoiceDetailsY, 'Kunden-/Auftrag', invoice.customerReference);
  invoiceDetailsY = drawInvoiceDetail(invoiceDetailsY, 'Kundenbestellnummer', invoice.buyerOrderNumber);
  invoiceDetailsY = drawInvoiceDetail(invoiceDetailsY, 'Verwendungszweck', invoice.commission);
  invoiceDetailsY = drawInvoiceDetail(invoiceDetailsY, 'Zahlungsart', paymentMethodMap[invoice.paymentMethod]);
  if (creditTransferMethods.has(invoice.paymentMethod)) {
    invoiceDetailsY = drawInvoiceDetail(invoiceDetailsY, 'IBAN Zahlungsempfänger', normalizeIban(invoice.paymentIban));
  }
  if (directDebitMethods.has(invoice.paymentMethod)) {
    invoiceDetailsY = drawInvoiceDetail(invoiceDetailsY, 'IBAN Zahler', normalizeIban(invoice.debtorIban));
    invoiceDetailsY = drawInvoiceDetail(invoiceDetailsY, 'Mandatsreferenz', invoice.mandateReference);
    if (invoice.creditorIdentifier) {
      invoiceDetailsY = drawInvoiceDetail(invoiceDetailsY, 'Gläubiger-ID', invoice.creditorIdentifier);
    }
  }
  invoiceDetailsY = drawInvoiceDetail(invoiceDetailsY, 'Zahlungsbedingungen', invoice.paymentTerms);

  const totals = invoice.lines.reduce((sum, line) => {
    const amounts = calculateLineAmounts(line);
    sum.net += amounts.netLine;
    sum.vat += amounts.vatLine;
    sum.gross += amounts.grossLine;
    return sum;
  }, { net: 0, vat: 0, gross: 0 });

  const totalsWidth = 250;
  const totalsHeight = 58;
  const totalsX = pageWidth - margin - totalsWidth;

  let yPos = drawItemsHeader(invoiceDetailsY - 10, 'Positionen');
  const rowHeight = 18;
  invoice.lines.forEach((line) => {
    if (yPos < margin + rowHeight) {
      addPage();
      page.drawText('ZUGFeRD / Factur-X · Positionen (Fortsetzung)', {
        x: margin,
        y: pageHeight - 54,
        size: 15,
        font: boldFont,
        color: headingColor,
      });
      page.drawText(`Rechnungsnummer: ${invoice.invoiceNumber}`, {
        x: margin,
        y: pageHeight - 74,
        size: 9,
        font,
        color: mutedColor,
      });
      yPos = drawItemsHeader(pageHeight - 105, 'Positionen (Fortsetzung)');
    }

    const lineAmount = calculateLineAmounts(line);
    const values = [
      String(line.itemNumber || ''),
      String(line.description || ''),
      Number(line.quantity || 0).toString(),
      currencyFormatter.format(Number(line.unitPrice || 0)),
      `${Number(line.discount || 0).toFixed(2)} %`,
      `${Number(line.vat || 0).toFixed(2)} %`,
      currencyFormatter.format(lineAmount.grossLine),
    ];
    let columnX = margin;
    values.forEach((value, index) => {
      const column = itemColumns[index];
      const lines = wrapText(value, font, 7.5, column.width - 6);
      page.drawText(lines[0], {
        x: columnX,
        y: yPos,
        size: 7.5,
        font,
        color: textColor,
      });
      columnX += column.width;
    });
    page.drawLine({
      start: { x: margin, y: yPos - 6 },
      end: { x: pageWidth - margin, y: yPos - 6 },
      thickness: 0.5,
      color: rgb(0.86, 0.89, 0.93),
    });
    yPos -= rowHeight;
  });

  if (yPos - totalsHeight - 8 < margin) {
    addPage();
    page.drawText('ZUGFeRD / Factur-X · Zusammenfassung', {
      x: margin,
      y: pageHeight - 54,
      size: 15,
      font: boldFont,
      color: headingColor,
    });
    page.drawText(`Rechnungsnummer: ${invoice.invoiceNumber}`, {
      x: margin,
      y: pageHeight - 74,
      size: 9,
      font,
      color: mutedColor,
    });
    yPos = pageHeight - 105;
  }

  const totalsHeadingY = yPos - 8;
  const totalsValueX = pageWidth - margin;
  page.drawText('Gesamt', {
    x: totalsX,
    y: totalsHeadingY,
    size: 10,
    font: boldFont,
    color: textColor,
  });

  const totalRows = [
    { label: 'Netto', value: currencyFormatter.format(totals.net) },
    { label: 'USt.', value: currencyFormatter.format(totals.vat) },
    { label: 'Brutto', value: currencyFormatter.format(totals.gross), emphasize: true },
  ];
  totalRows.forEach(({ label, value, emphasize }, index) => {
    const rowY = totalsHeadingY - 17 - index * 14;
    const rowFont = emphasize ? boldFont : font;
    const rowSize = emphasize ? 9 : 8;

    if (emphasize) {
      page.drawLine({
        start: { x: totalsX + 130, y: rowY + 8 },
        end: { x: totalsValueX, y: rowY + 8 },
        thickness: 0.8,
        color: textColor,
      });
    }

    page.drawText(label, {
      x: totalsX,
      y: rowY,
      size: rowSize,
      font: rowFont,
      color: textColor,
    });
    page.drawText(value, {
      x: totalsValueX - rowFont.widthOfTextAtSize(value, rowSize),
      y: rowY,
      size: rowSize,
      font: rowFont,
      color: textColor,
    });
  });

  pages.forEach((pdfPage, index) => {
    pdfPage.drawLine({
      start: { x: margin, y: 30 },
      end: { x: pageWidth - margin, y: 30 },
      thickness: 0.5,
      color: rgb(0.86, 0.89, 0.93),
    });
    pdfPage.drawText(`Seite ${index + 1}`, {
      x: pageWidth - margin - 42,
      y: 16,
      size: 8,
      font,
      color: mutedColor,
    });
  });

  await pdfDoc.attach(new TextEncoder().encode(xmlContent), 'factur-x.xml', {
    mimeType: 'application/xml',
    description: 'ZUGFeRD / Factur-X invoice payload',
    afRelationship: AFRelationship.Alternative,
  });

  const bytes = await pdfDoc.save();
  return bytes;
}

async function handleDownload() {
  const invoice = getInvoiceData();
  const errors = validateInvoice(invoice);
  showValidationErrors(errors);

  if (errors.length > 0) {
    return;
  }

  const xmlContent = buildXmlInvoice(invoice);
  const bytes = await generatePdf(invoice, xmlContent);
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `factur-x-${invoice.invoiceNumber}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

document.addEventListener('input', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  if (target.dataset.lineIndex !== undefined && target.dataset.field) {
    const lineIndex = Number(target.dataset.lineIndex);
    const field = target.dataset.field;
    syncLineFromInput(lineIndex, field, target.value);
    saveDraft();
    return;
  }

  updateTotals();
  saveDraft();
});

document.addEventListener('change', (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement
    || target instanceof HTMLSelectElement
    || target instanceof HTMLTextAreaElement) {
    saveDraft();
  }
});

document.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target.closest('button') : null;
  if (!target) return;

  if (target.id === 'openProfileHelpButton') {
    document.getElementById('profileHelpDialog').showModal();
    return;
  }

  if (target.dataset.removeLine !== undefined) {
    removeLine(Number(target.dataset.removeLine));
    return;
  }

  if (target.id === 'addLineButton') {
    addLine();
    return;
  }

  if (target.id === 'validateButton') {
    validateAndShow();
    return;
  }

  if (target.id === 'downloadButton') {
    handleDownload();
  }
});

document.getElementById('profileSelect').addEventListener('change', () => {
  updateProfileInfo();
  updatePaymentFields();
  updateTotals();
});

document.getElementById('paymentMethod').addEventListener('change', () => {
  updatePaymentFields();
  updateTotals();
});

loadDraft();
updateProfileInfo();
updatePaymentFields();
renderLineRows();
validateAndShow();
