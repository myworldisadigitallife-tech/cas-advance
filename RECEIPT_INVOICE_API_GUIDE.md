# Receipt/Invoice API Guide

This guide explains how to create and generate receipt/invoice payloads using the CAS System API.

Base URL:

- `http://127.0.0.1:8000/api/`

Authentication:

- Use session auth, basic auth, or token auth.
- For token auth, include:

```http
Authorization: Token <your_token>
```

## 1) Create Receipt/Invoice (Saved to Database)

Endpoint:

- `POST /api/receipt-invoices/`

Purpose:

- Creates a journal entry and returns both the saved entry and a receipt/invoice payload.
- For VAT invoices, this endpoint enforces BIR-critical requirements.

Request body:

```json
{
  "book_type": "CR",
  "period_id": 1,
  "transaction_date": "2026-04-12",
  "reference_no": "OR-2026-001",
  "description": "Customer payment for consulting",
  "buyer_registered_name": "ABC Trading Inc.",
  "buyer_address": "Makati City",
  "buyer_tin": "123-456-789-000",
  "line_items": [
    {
      "account": 1,
      "particulars": "Cash receipt",
      "debit_amount": "2500.00",
      "credit_amount": "0.00"
    },
    {
      "account": 6,
      "particulars": "Consulting revenue",
      "debit_amount": "0.00",
      "credit_amount": "2500.00"
    }
  ]
}
```

Success response:

- `201 Created`

Response shape:

```json
{
  "message": "Receipt/Invoice created successfully.",
  "entry": {
    "id": 10,
    "entry_no": "CR-20260412-0001",
    "book_type": "CR"
  },
  "receipt_invoice": {
    "entry_id": 10,
    "document_title": "Sales Invoice",
    "document_number": "OR-2026-001",
    "serial_number": "CR-20260412-0001",
    "item_rows": [],
    "total_amount": "2500.00"
  }
}
```

Notes:

- This endpoint follows journal-entry validation rules.
- `line_items` must be balanced (total debit equals total credit).
- At least two lines are required.
- Cannot issue VAT Invoice if seller is not VAT-registered.
- Cannot issue VAT Invoice without `buyer_registered_name` and `buyer_tin`.
- VAT is auto-calculated separately at 12% for VAT-registered invoice lines.
- Output is forced to label `VAT Invoice` for VAT-registered invoices.

## 2) Generate Receipt/Invoice (Preview Only, Not Saved)

Endpoint:

- `POST /api/receipt-invoices/generate/`

Purpose:

- Generates a receipt/invoice payload preview from input data without creating a journal entry.

Request body:

```json
{
  "book_type": "SJ",
  "transaction_date": "2026-04-12",
  "reference_no": "SI-2026-010",
  "description": "Preview sales invoice",
  "buyer_registered_name": "ABC Trading Inc.",
  "buyer_address": "Makati City",
  "buyer_tin": "123-456-789-000",
  "line_items": [
    {
      "account": 1,
      "particulars": "Cash",
      "debit_amount": "1500.00",
      "credit_amount": "0.00"
    },
    {
      "account": 6,
      "particulars": "Sales",
      "debit_amount": "0.00",
      "credit_amount": "1500.00"
    }
  ]
}
```

Success response:

- `200 OK`

Response highlights:

- `serial_number` will use preview format like `PREVIEW-20260412`.
- No journal entry is saved.

## 3) Generate from Existing Entry

Endpoint:

- `POST /api/receipt-invoices/generate/`

Purpose:

- Builds a receipt/invoice payload from an already saved journal entry.

Request body:

```json
{
  "entry_id": 10
}
```

Success response:

- `200 OK`

Response highlights:

- Returns the same receipt/invoice structure using the saved entry data.

## 4) Existing Related Read APIs

- `GET /api/reports/receipt-invoices/` (list)
- `GET /api/reports/receipt-invoices/{entry_id}/` (detail, now includes `download_url`)
- `GET /api/reports/receipt-invoices/{entry_id}/download/` (download PDF file)
- `GET /api/reports/receipt-invoices/{entry_id}/xml/` (structured XML)

### Detail Response Download Link

When you call `GET /api/reports/receipt-invoices/{entry_id}/`, the response includes:

```json
{
  "entry_id": 10,
  "document_title": "Sales Invoice",
  "document_number": "OR-2026-001",
  "download_url": "http://127.0.0.1:8000/api/reports/receipt-invoices/10/download/"
}
```

You can use `download_url` directly in your frontend so users can download the generated receipt/invoice PDF.

The detail response also includes `structured_formats` containing JSON and XML links for CAS/e-invoicing structured storage.

## BIR Compliance Coverage

- Seller VAT registration shown explicitly.
- Invoice label forced to `VAT Invoice` for VAT-registered invoices.
- Buyer registered name, address, and TIN included in output.
- VAT breakdown shown explicitly: VATable sales, VAT amount (12%), zero-rated sale, VAT-exempt sale.
- CAS control number and BIR registration reference included.
- Structured format available in JSON and XML for audit retrieval.

## 5) Book Type Reference

- `GJ` = General Journal
- `GL` = General Ledger
- `CR` = Cash Receipts Book
- `CD` = Cash Disbursements Book
- `SJ` = Sales Journal
- `PJ` = Purchases Journal
