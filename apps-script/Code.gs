const SPREADSHEET_ID = '1SFjp-b1T5kFaiuxBPORXma7N0W0wPDdTvsaspILtnr4';
const SHEET_NAME = 'Sheet1';
const DOC_TEMPLATE_ID = '17oUCl6b9X2s31L9BXSJfN095HZmUlnBWY0q6a9SNlTQ';
const GENERATED_DOC_PREFIX = 'Investment Memo';

const FIELDS = [
  'company_name',
  'fund',
  'ceo',
  'source',
  'investment_amount',
  'initial_ownership',
  'prior_equity_capital_raised',
  'thesis',
  'business',
  'industry',
  'location',
  'security',
  'round_size',
  'post_money_valuation',
  'effective_pre_money_valuation',
  'post_money_liquidation_pref',
  'lead_investor',
  'other_investors',
  'board_seat',
  'closing_date'
];

function doPost(e) {
  try {
    if ((e.parameter.action || '').trim() === 'generate_doc') {
      return respondWithDocGenerationResult(e);
    }

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);

    if (!sheet) {
      return jsonResponse({ ok: false, error: `Sheet not found: ${SHEET_NAME}` });
    }

    const row = FIELDS.map((field) => (e.parameter[field] || '').trim());
    sheet.appendRow(row);

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  }
}

function doGet(e) {
  if (e && (e.parameter.action || '').trim() === 'generate_doc') {
    return respondWithDocGenerationResult(e);
  }

  return jsonResponse({ ok: true, service: 'investment-intake-webapp' });
}

function generateDocForLatestRow() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  const lastRow = sheet.getLastRow();

  if (lastRow < 1) {
    throw new Error('No rows found in the sheet.');
  }

  return generateDocFromRowNumber(lastRow);
}

function generateDocForCompanyName(companyName) {
  if (!companyName) {
    throw new Error('Company name is required.');
  }

  const rows = getAllDataRows();
  const match = rows.find((row) => row.company_name === companyName);

  if (!match) {
    throw new Error(`Company not found: ${companyName}`);
  }

  return createDocFromData(match);
}

function generateDocFromRowNumber(rowNumber) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  const rowValues = sheet.getRange(rowNumber, 1, 1, FIELDS.length).getValues()[0];
  const data = toObject(rowValues);
  return createDocFromData(data);
}

function handleGenerateDocRequest(e) {
  const companyName = (e.parameter.company_name || '').trim();
  const rowNumberRaw = (e.parameter.row_number || '').trim();

  if (companyName) {
    return generateDocForCompanyName(companyName);
  }

  if (rowNumberRaw) {
    const rowNumber = Number(rowNumberRaw);
    if (Number.isNaN(rowNumber) || rowNumber < 1) {
      throw new Error('row_number must be a positive number.');
    }
    return generateDocFromRowNumber(rowNumber);
  }

  return generateDocForLatestRow();
}

function respondWithDocGenerationResult(e) {
  try {
    const docUrl = handleGenerateDocRequest(e);
    if (wantsRedirect(e)) {
      return redirectToUrl(docUrl);
    }
    return jsonResponse({ ok: true, doc_url: docUrl });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  }
}

function wantsRedirect(e) {
  const redirectFlag = String((e.parameter.redirect || '')).toLowerCase();
  return redirectFlag === '1' || redirectFlag === 'true' || redirectFlag === 'yes';
}

function redirectToUrl(url) {
  const safeUrl = JSON.stringify(url);
  return HtmlService.createHtmlOutput(
    `<!doctype html><html><head><meta charset="utf-8"><title>Opening document...</title></head><body><p>Opening generated document...</p><script>window.location.replace(${safeUrl});</script></body></html>`
  );
}

function createDocFromData(data) {
  const templateFile = DriveApp.getFileById(DOC_TEMPLATE_ID);
  const company = data.company_name || 'Unknown Company';
  const fileName = `${GENERATED_DOC_PREFIX} - ${company}`;
  const copy = makeCopyInTemplateFolder(templateFile, fileName);

  const doc = DocumentApp.openById(copy.getId());
  const body = doc.getBody();
  const replacements = buildReplacementMap(data);

  Object.keys(replacements).forEach((token) => {
    body.replaceText(escapeRegex(token), replacements[token]);
  });

  doc.saveAndClose();
  return doc.getUrl();
}

function makeCopyInTemplateFolder(templateFile, fileName) {
  const parents = templateFile.getParents();
  if (parents.hasNext()) {
    return templateFile.makeCopy(fileName, parents.next());
  }
  return templateFile.makeCopy(fileName);
}

function getAllDataRows() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  const lastRow = sheet.getLastRow();
  if (lastRow < 1) {
    return [];
  }

  const values = sheet.getRange(1, 1, lastRow, FIELDS.length).getValues();
  return values
    .map((rowValues) => toObject(rowValues))
    .filter((row) => Boolean(row.company_name));
}

function toObject(rowValues) {
  const result = {};
  FIELDS.forEach((field, index) => {
    const value = rowValues[index];
    result[field] = value instanceof Date ? formatDate(value) : String(value || '').trim();
  });
  return result;
}

function formatDate(dateValue) {
  return Utilities.formatDate(dateValue, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function buildReplacementMap(data) {
  const map = {};

  FIELDS.forEach((field) => {
    const display = toDisplayName(field);
    const value = data[field] || '';

    map[`{{${field}}}`] = value;
    map[`<<${field}>>`] = value;
    map[`{{${display}}}`] = value;
    map[`<<${display}>>`] = value;
  });

  return map;
}

function toDisplayName(field) {
  return field
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
