# API Endpoint Reference

Base URL: `http://127.0.0.1:8000/api/`

All endpoints return JSON.

## Authentication

- Default auth: session auth, basic auth, or token auth
- Default permission: authenticated user required
- Exception: `POST /api/auth/token/` does not require authentication

Token header:

```http
Authorization: Token <your_token>
```

## Common Behavior

### Pagination

Paginated list endpoints support:

- `page`
- `page_size`

Default page size is `25`.

### Common Filters

Some reporting endpoints support one or more of these query params:

- `start_date=YYYY-MM-DD`
- `end_date=YYYY-MM-DD`
- `search=<text>`
- `reference_no=<text>`
- `book_type=<GJ|GL|CR|CD|SJ|PJ>`
- `period_id=<id>`
- `account_id=<id>`
- `account_type=<ASSET|LIABILITY|EQUITY|INCOME|EXPENSE>`
- `tax_code=<code>`
- `is_voided=true|false`

Boolean query params accept `true/false`, `yes/no`, or `1/0`.

## Authentication Endpoints

### POST `/api/auth/token/`

Create or retrieve an API token.

Auth required: No

Request body:

```json
{
  "username": "apiuser",
  "password": "StrongPass123"
}
```

Response:

```json
{
  "token": "<token>",
  "username": "apiuser"
}
```

### POST `/api/auth/token/revoke/`

Revoke the current user's token.

Auth required: Yes

Response: `204 No Content`

## Discovery

### GET `/api/`

Returns top-level API links.

Auth required: Yes

Response keys:

- `token_auth`
- `token_revoke`
- `profile`
- `dashboard`
- `accounts`
- `periods`
- `tax_codes`
- `journal_entries`
- `audit_logs`
- `ai_journal_entries`

## Profile

### GET `/api/profile/`

Return the authenticated user's accounting profile.

### PATCH `/api/profile/`

Partially update the authenticated user's accounting profile.

Writable fields:

- `business_name`
- `trade_name`
- `registered_name`
- `vat_status`
- `tin_branch`
- `registered_address`

Read-only fields:

- `username`
- `created_at`

## Dashboard

### GET `/api/dashboard/`

Return summary counters and recent journal entries.

Response keys:

- `accounts_count`
- `entries_count`
- `recent_entries`

## Accounts

### GET `/api/accounts/`

List the authenticated user's accounts.

### POST `/api/accounts/`

Create an account.

Request body:

```json
{
  "code": "1100",
  "name": "Petty Cash",
  "account_type": "ASSET",
  "notes": "Optional",
  "is_active": true
}
```

### GET `/api/accounts/{id}/`

Return one account.

### PUT `/api/accounts/{id}/`

Replace one account.

### PATCH `/api/accounts/{id}/`

Partially update one account.

### DELETE `/api/accounts/{id}/`

Delete one account.

## Accounting Periods

### GET `/api/periods/`

List the authenticated user's periods.

### POST `/api/periods/`

Create an accounting period.

Request body:

```json
{
  "year": 2026,
  "month": 4
}
```

Notes:

- `start_date` and `end_date` are system-generated from `year` and `month`
- `label` is read-only

### GET `/api/periods/{id}/`

Return one period.

### PUT `/api/periods/{id}/`

Replace one period.

### PATCH `/api/periods/{id}/`

Partially update one period.

### DELETE `/api/periods/{id}/`

Delete one period.

## Tax Codes

### GET `/api/tax-codes/`

List the authenticated user's tax codes.

### POST `/api/tax-codes/`

Create a tax code.

Request body:

```json
{
  "code": "VAT12",
  "description": "VAT 12%",
  "rate": "12.00",
  "is_withholding": false
}
```

### GET `/api/tax-codes/{id}/`

Return one tax code.

### PUT `/api/tax-codes/{id}/`

Replace one tax code.

### PATCH `/api/tax-codes/{id}/`

Partially update one tax code.

### DELETE `/api/tax-codes/{id}/`

Delete one tax code.

## Journal Entries

### GET `/api/journal-entries/`

List journal entries created by the authenticated user.

### POST `/api/journal-entries/`

Create a journal entry.

Request body:

```json
{
  "book_type": "GJ",
  "period_id": 1,
  "transaction_date": "2026-04-10",
  "reference_no": "API-001",
  "description": "Service income from API",
  "line_items": [
    {
      "account": 1,
      "particulars": "Cash received",
      "debit_amount": "1000.00",
      "credit_amount": "0.00"
    },
    {
      "account": 6,
      "particulars": "Service income",
      "debit_amount": "0.00",
      "credit_amount": "1000.00"
    }
  ]
}
```

Validation rules:

- At least two lines are required
- Each line must have either debit or credit, not both
- Total debit must equal total credit
- Accounts and tax codes must belong to the authenticated user
- Inactive accounts cannot be used

Book type values:

- `GJ` = General Journal
- `GL` = General Ledger
- `CR` = Cash Receipts Book
- `CD` = Cash Disbursements Book
- `SJ` = Sales Journal
- `PJ` = Purchases Journal

### GET `/api/journal-entries/{id}/`

Return one journal entry.

### POST `/api/journal-entries/{id}/void/`

Void a posted journal entry.

Request body:

```json
{
  "void_reason": "Duplicate entry"
}
```

## Audit Logs

### GET `/api/audit-logs/`

List audit logs performed by the authenticated user.

### GET `/api/audit-logs/{id}/`

Return one audit log.

## AI-Assisted Journal Creation

### POST `/api/ai/journal-entries/`

Generate a journal entry from narrative text.

Request body:

```json
{
  "transaction_text": "Received cash for consulting services worth 1000 pesos"
}
```

Response keys:

- `message`
- `entry`

## Report Endpoints

### GET `/api/reports/journal/`

Paginated journal report of the authenticated user's entries.

Filters:

- `start_date`
- `end_date`
- `book_type`
- `reference_no`
- `search`
- `is_voided`
- `period_id`

### GET `/api/reports/sales-journal/`

Paginated report for `SJ` entries.

Filters:

- `start_date`
- `end_date`
- `reference_no`
- `search`
- `is_voided`
- `period_id`

### GET `/api/reports/purchases-journal/`

Paginated report for `PJ` entries.

Filters:

- `start_date`
- `end_date`
- `reference_no`
- `search`
- `is_voided`
- `period_id`

### GET `/api/reports/inventory-book/`

Paginated report of asset-account journal lines.

Filters:

- `start_date`
- `end_date`
- `account_id`
- `account_type`
- `tax_code`
- `search`
- `is_voided`

### GET `/api/reports/audit-trail/`

Paginated audit trail report.

Filters:

- `start_date`
- `end_date`
- `search`

### GET `/api/reports/receipt-invoices/`

Paginated list of journal entries available as receipt or invoice style output.

Filters:

- `start_date`
- `end_date`
- `book_type`
- `reference_no`
- `search`
- `is_voided`
- `period_id`

### GET `/api/reports/receipt-invoices/{entry_id}/`

Return receipt or invoice detail for a specific journal entry.

Response includes:

- document metadata
- seller info
- item rows
- VAT breakdown

### GET `/api/reports/tax-summary/`

Paginated tax summary report for journal lines with tax codes.

Filters:

- `start_date`
- `end_date`
- `account_id`
- `account_type`
- `tax_code`
- `search`
- `is_voided`

Response also includes:

- `summary_rows`
- `total_base`
- `total_tax`

### GET `/api/reports/ledger/`

Paginated ledger summary by account.

Filters:

- `account_type`
- `search`

Response also includes:

- `journal_line_rows`

### GET `/api/reports/trial-balance/`

Paginated trial balance by account.

Filters:

- `account_type`
- `search`

Response also includes:

- `total_debit`
- `total_credit`

### GET `/api/reports/financial-statements/`

Return financial statement aggregates and quarterly breakdowns.

Response includes:

- income accounts
- expense accounts
- assets
- liabilities
- equity
- `gross_revenue`
- `total_expense`
- `net_income`
- `quarterly_reports`
- taxpayer and software metadata

### GET `/api/reports/system-generated/`

Return a small list of system-generated reports and counts.

## Notes For Testing

- Router-backed list endpoints use paginated responses with `count`, `next`, `previous`, and `results`
- User-scoped resources only show data owned by the authenticated user
- Journal entry numbers are system-generated
- Voiding is supported through a custom action, not by updating the main journal entry endpoint