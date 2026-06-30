# API Reference

The API surface currently focuses on AI workflows, uploads, alerts, summaries,
and webhook ingestion.

## `GET /api/gemini`

- Returns the default AI model and supported workflows.
- Response shape includes `ok`, `model`, and `workflows`.

## `POST /api/gemini`

- Body:

```json
{
  "workflow": "document_extraction",
  "input": {}
}
```

- Supported workflows:
  - `document_extraction`
  - `visit_summary`
- The route dispatches to the AI extraction or summarization service and
  returns the generated result.

## `POST /api/upload`

- Accepts multipart form data.
- Expected fields include the file plus document metadata such as `patientId`
  and `title`.
- Stores the file in Firebase Storage and writes the document record to
  Firestore.
- Rejects unsupported file types and oversized uploads.

## `/api/alerts`

### `GET`

- Accepts alert filters through the query string.
- Returns `items` plus a `summary` object.

### `POST`

- Creates a new alert record.

### `PATCH`

- Updates, acknowledges, resolves, dismisses, or deletes an alert depending on
  the payload.

### `DELETE`

- Deletes an alert by ID.

## `/api/summary`

### `GET`

- Supports patient and physician lookup plus a `pending` flag.

### `POST`

- Creates a new summary record.

### `PATCH`

- Updates, publishes, approves, rejects, or deletes a summary.

### `DELETE`

- Deletes a summary by ID.

## `/api/webhooks`

### `GET`

- Returns supported webhook event types.

### `POST`

- Accepts webhook payloads such as `ping`, `alert.created`, and
  `summary.created`.
- The route can log or transform incoming events before handing them to the
  relevant service functions.

## Error Shape

The routes generally return JSON with an error message when validation or
runtime work fails. Client code should treat non-2xx responses as actionable
failures and surface the message in the UI.
