// Deploy Apps Script as a Web App and paste its URL here.
const APPS_SCRIPT_CONFIG = {
  webAppUrl: "https://script.google.com/macros/s/AKfycbyivhIu2tUwkwUIYeSZdHgWmN3hxLizsxPbmyoPPeqUeYQLgIwEU3THMxzlTIbYxU4/exec",
  fields: [
    "company_name",
    "fund",
    "ceo",
    "source",
    "investment_amount",
    "initial_ownership",
    "prior_equity_capital_raised",
    "thesis",
    "business",
    "industry",
    "location",
    "security",
    "round_size",
    "post_money_valuation",
    "effective_pre_money_valuation",
    "post_money_liquidation_pref",
    "lead_investor",
    "other_investors",
    "board_seat",
    "closing_date"
  ]
};

const form = document.querySelector("#investment-form");
const statusEl = document.querySelector("#status");
const submitBtn = document.querySelector("#submit-btn");
const generateDocBtn = document.querySelector("#generate-doc-btn");

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#b52a1b" : "#4f576a";
}

function toPayload(formData) {
  const payload = new URLSearchParams();

  for (const field of APPS_SCRIPT_CONFIG.fields) {
    payload.append(field, formData.get(field) ?? "");
  }

  return payload;
}

async function submitToAppsScript(formData) {
  const payload = toPayload(formData);

  await fetch(APPS_SCRIPT_CONFIG.webAppUrl, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: payload.toString()
  });
}

function buildGenerateDocUrl() {
  const companyName = (form.elements.company_name.value || "").trim();
  const url = new URL(APPS_SCRIPT_CONFIG.webAppUrl);
  url.searchParams.set("action", "generate_doc");
  url.searchParams.set("redirect", "1");

  if (companyName) {
    url.searchParams.set("company_name", companyName);
  }

  return url.toString();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  if (APPS_SCRIPT_CONFIG.webAppUrl.includes("YOUR_DEPLOYMENT_ID")) {
    setStatus("Set your Apps Script Web App URL in app.js before submitting.", true);
    return;
  }

  submitBtn.disabled = true;
  setStatus("Submitting...");

  try {
    const formData = new FormData(form);
    await submitToAppsScript(formData);
    setStatus("Submitted. Check your Google Sheet for the new row.");
    form.reset();
  } catch (error) {
    setStatus(error.message || "Submission failed.", true);
  } finally {
    submitBtn.disabled = false;
  }
});

generateDocBtn.addEventListener("click", () => {
  if (APPS_SCRIPT_CONFIG.webAppUrl.includes("YOUR_DEPLOYMENT_ID")) {
    setStatus("Set your Apps Script Web App URL in app.js before generating docs.", true);
    return;
  }

  const companyName = (form.elements.company_name.value || "").trim();
  if (!companyName) {
    setStatus("Enter Company name first so the correct doc is generated.", true);
    return;
  }

  const generateUrl = buildGenerateDocUrl();
  setStatus("Generating doc...");
  window.open(generateUrl, "_blank", "noopener,noreferrer");
});
