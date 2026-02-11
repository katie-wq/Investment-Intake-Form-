# Apps Script Backend Setup

This script does two things from one deployed Web App:

- receives POST submissions from the frontend and appends rows to your Google Sheet
- generates a filled Google Doc from a company row in the sheet

## 1. Create Apps Script project

1. Open [script.new](https://script.new).
2. Replace default code with the contents of `Code.gs` in this folder.
3. Save the project.

## 2. Confirm sheet tab name

- In `Code.gs`, set `SHEET_NAME` to the exact tab name in your spreadsheet.
- Spreadsheet ID is already set to:
  - `1SFjp-b1T5kFaiuxBPORXma7N0W0wPDdTvsaspILtnr4`

## 3. Deploy as Web App

1. Click **Deploy** -> **New deployment**.
2. Type: **Web app**.
3. Execute as: **Me**.
4. Who has access: **Anyone**.
5. Deploy and authorize.
6. Copy the Web App URL (ends in `/exec`).

## 4. Connect frontend

In `/Users/katievasquez/Documents/New project/app.js`, set:

- `APPS_SCRIPT_CONFIG.webAppUrl = "https://script.google.com/macros/s/.../exec"`

## 5. Test

1. Run frontend locally.
2. Submit a row.
3. Confirm new row appears in your sheet tab.

## 6. Configure Google Doc generation

The script is already configured to use your doc template:

- Template doc ID: `17oUCl6b9X2s31L9BXSJfN095HZmUlnBWY0q6a9SNlTQ`

In the Google Doc template, add placeholders for any fields you want populated.

Supported placeholder formats:

- `{{company_name}}` or `<<company_name>>`
- `{{Company Name}}` or `<<Company Name>>`

Field keys:

- `company_name`
- `fund`
- `ceo`
- `source`
- `investment_amount`
- `initial_ownership`
- `prior_equity_capital_raised`
- `thesis`
- `business`
- `industry`
- `location`
- `security`
- `round_size`
- `post_money_valuation`
- `effective_pre_money_valuation`
- `post_money_liquidation_pref`
- `lead_investor`
- `other_investors`
- `board_seat`
- `closing_date`

## 7. Generate docs (3 options)

### Option A: Generate for latest row

GET or POST your deployed Web App URL with:

- `action=generate_doc`

### Option B: Generate by company name

GET or POST with:

- `action=generate_doc`
- `company_name=Exact Company Name`

### Option C: Generate by row number

GET or POST with:

- `action=generate_doc`
- `row_number=12`

Response format:

```json
{
  "ok": true,
  "doc_url": "https://docs.google.com/document/d/..."
}
```

Notes:

- If both `company_name` and `row_number` are missing, script uses latest row.
- If both are provided, `company_name` is used first.
- Generated docs are copied from the template and saved in the same Drive folder when possible.
- Add `redirect=1` to open the generated doc directly in the browser instead of returning JSON.

## Field order written to sheet

1. company_name
2. fund
3. ceo
4. source
5. investment_amount
6. initial_ownership
7. prior_equity_capital_raised
8. thesis
9. business
10. industry
11. location
12. security
13. round_size
14. post_money_valuation
15. effective_pre_money_valuation
16. post_money_liquidation_pref
17. lead_investor
18. other_investors
19. board_seat
20. closing_date
