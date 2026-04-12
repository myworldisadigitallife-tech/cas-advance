# Financial Statement Report API Guide

This guide explains how to consume the Financial Statements report endpoint in the CAS System API.

Base URL:

- `http://127.0.0.1:8000/api/`

Authentication:

- Use session auth, basic auth, or token auth.
- For token auth, include:

```http
Authorization: Token <your_token>
```

## Endpoint

- `GET /api/reports/financial-statements/`

## Purpose

Returns Income Statement and Statement of Financial Position aggregates, including account-level breakdowns and quarterly summaries for a target report year.

## Query Parameters

All parameters are optional.

- `start_date=YYYY-MM-DD`
- `end_date=YYYY-MM-DD`
- `period_id=<id>`
- `is_voided=true|false|yes|no|1|0`
- `report_year=YYYY`

Behavior notes:

- If `is_voided` is omitted, the endpoint defaults to non-voided entries only (`is_voided=false`).
- `report_year` controls the `quarterly_reports` grouping year.
- If `report_year` is omitted, the endpoint uses `end_date` year when provided; otherwise the current year.

## Example Request

```http
GET /api/reports/financial-statements/?start_date=2026-01-01&end_date=2026-12-31&period_id=3&report_year=2026
```

## Success Response

- `200 OK`

Response highlights:

```json
{
  "income_by_account": [
    {
      "account_id": 6,
      "account_code": "4000",
      "account_name": "Service Income",
      "account_type": "INCOME",
      "amount": "250000.00"
    }
  ],
  "expense_by_account": [],
  "current_assets": [],
  "noncurrent_assets": [],
  "current_liabilities": [],
  "noncurrent_liabilities": [],
  "equity_by_account": [],
  "gross_revenue": "250000.00",
  "total_expense": "120000.00",
  "net_income": "130000.00",
  "total_assets": "300000.00",
  "total_liabilities": "50000.00",
  "total_equity": "250000.00",
  "total_liabilities_and_equity": "300000.00",
  "quarter_report_year": 2026,
  "quarterly_reports": [
    {
      "quarter": "Q1",
      "coverage": "January 1 - March 31",
      "deadline": "April 25",
      "gross_revenue": "50000.00",
      "total_expense": "20000.00",
      "net_income": "30000.00"
    }
  ],
  "taxpayer_registered_name": "ABC Trading Inc.",
  "report_generated_address": "Makati City",
  "vat_or_non_vat_tin": "VAT 123-456-789-000",
  "software_name_version": "CAS System v1.2.0",
  "report_generated_by": "apiuser",
  "report_generated_timestamp": "2026-04-12 14:23:59 PST",
  "filters": {
    "start_date": "2026-01-01",
    "end_date": "2026-12-31",
    "period_id": 3,
    "is_voided": false,
    "report_year": 2026
  }
}
```

## PDF Download Return URL

You can expose a PDF download/open URL in the frontend for the same active filters.

Preferred behavior:

- Use a URL returned by the API response when available (for example: `download_url`, `pdf_url`, `financial_statement_pdf_url`, or `links.pdf`).
- If no PDF URL field is returned, build a fallback URL using the server-rendered report endpoint:

Implemented API fields:

- `download_url`
- `pdf_url`
- `financial_statement_pdf_url`
- `links.pdf`

```http
http://127.0.0.1:8000/reports/financial-statements/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&period_id=<id>&is_voided=false&report_year=YYYY&format=pdf
```

Notes:

- Keep the same filter values used for `GET /api/reports/financial-statements/`.
- Include only filters that have values.
- `format=pdf` is used to request PDF output from the server-rendered report endpoint.

## Error Response

- `400 Bad Request` when `report_year` is not a valid integer.

Example:

```json
{
  "report_year": ["Report year must be a valid integer."]
}
```

## Data Structure Notes

- `income_by_account`, `expense_by_account`, `equity_by_account` are account-level grouped totals.
- `current_assets` and `noncurrent_assets` are split using account-name heuristics.
- `current_liabilities` and `noncurrent_liabilities` are split using account-name heuristics.
- `quarterly_reports` always includes Q1 to Q4 entries for the selected report year.
