# Investment Intake Frontend

This project provides a front-end form that captures:

- company name
- fund
- CEO
- source
- investment amount
- initial ownership
- prior equity capital raised
- thesis
- business
- industry
- location
- security
- round size
- post-money valuation
- effective pre-money valuation
- post-money liquidation pref
- lead investor
- other investors
- board seat
- closing date

## Files

- `index.html` - UI form
- `styles.css` - visual styling
- `app.js` - Apps Script submission logic
- `apps-script/Code.gs` - backend endpoint that writes to Google Sheets
- `apps-script/README.md` - deployment steps for Apps Script and doc generation

## Connect to your Google destination

Your spreadsheet URL is:

`https://docs.google.com/spreadsheets/d/1SFjp-b1T5kFaiuxBPORXma7N0W0wPDdTvsaspILtnr4/edit?usp=sharing`

This project now writes directly to that sheet through a Google Apps Script Web App.

1. Deploy `apps-script/Code.gs` as a Web App (see `apps-script/README.md`).
2. Copy the deployed `/exec` URL.
3. In `app.js`, set:
   - `APPS_SCRIPT_CONFIG.webAppUrl` to your deployed URL.

No `entry.xxxxx` field mapping is required with this setup. The frontend sends named fields directly.

## Run locally

Because this is static HTML/CSS/JS, open `index.html` in browser or serve it with:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Note

Submissions use `mode: no-cors`, so browser responses are opaque. Confirm success by checking for a new row in the sheet.

## Generate Google Docs from sheet rows

`apps-script/Code.gs` also includes a doc generation workflow for your template doc:

- template ID: `17oUCl6b9X2s31L9BXSJfN095HZmUlnBWY0q6a9SNlTQ`
- menu in Sheets: `Investment Docs`

See `/Users/katievasquez/Documents/New project/apps-script/README.md` for placeholder format and usage.
