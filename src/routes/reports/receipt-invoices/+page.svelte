<script>
  import { tick } from 'svelte';
  import { onMount } from 'svelte';
  import { API_BASE, buildAuthHeaders, readErrorMessage } from '$lib/api';

  /** @type {any[]} */
  let items = [];
  /** @type {any | null} */
  let selected = null;
  let loading = true;
  let detailLoading = false;
  let downloadLoading = false;
  let error = '';
  let detailError = '';
  let downloadError = '';

  /** @param {unknown} value */
  function safeValue(value) {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    return String(value);
  }

  /** @param {unknown} value */
  function formatCurrency(value) {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return safeValue(value);
    }

    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(numeric);
  }

  function scrollToBottomAfterView() {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'auto' });
  }

  onMount(async () => {
    try {
      const res = await fetch(`${API_BASE}/reports/receipt-invoices/`, {
        headers: buildAuthHeaders()
      });

      if (!res.ok) {
        throw new Error(await readErrorMessage(res, 'Failed to load receipt/invoices'));
      }

      const data = await res.json();
      items = Array.isArray(data) ? data : (data.results ?? []);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load receipt/invoices';
    } finally {
      loading = false;
    }
  });

  /** @param {number|string} entryId */
  async function viewDetail(entryId) {
    selected = null;
    detailError = '';
    detailLoading = true;

    try {
      const res = await fetch(`${API_BASE}/reports/receipt-invoices/${entryId}/`, {
        headers: buildAuthHeaders()
      });

      if (!res.ok) {
        throw new Error(await readErrorMessage(res, 'Failed to load detail'));
      }

      selected = await res.json();
      detailLoading = false;
      await tick();
      scrollToBottomAfterView();
    } catch (e) {
      detailError = e instanceof Error ? e.message : 'Failed to load detail';
    } finally {
      if (detailLoading) {
        detailLoading = false;
      }
    }
  }

  function clearDetail() {
    selected = null;
    detailError = '';
    downloadError = '';
  }

  /** @param {any} invoice */
  function getXmlUrl(invoice) {
    if (invoice?.xml_url) {
      return invoice.xml_url;
    }

    const structuredXml = invoice?.structured_formats?.xml;
    if (structuredXml) {
      return structuredXml;
    }

    const entryId = invoice?.entry_id ?? invoice?.id;
    return entryId ? `${API_BASE}/reports/receipt-invoices/${entryId}/xml/` : '';
  }

  /** @param {any} invoice */
  function getDownloadUrl(invoice) {
    if (invoice?.download_url) {
      return invoice.download_url;
    }

    const entryId = invoice?.entry_id ?? invoice?.id;
    return entryId ? `${API_BASE}/reports/receipt-invoices/${entryId}/download/` : '';
  }

  /** @param {any} invoice */
  async function downloadInvoice(invoice) {
    downloadError = '';
    const url = getDownloadUrl(invoice);

    if (!url) {
      downloadError = 'Download URL is not available for this record.';
      return;
    }

    downloadLoading = true;

    try {
      const res = await fetch(url, {
        headers: buildAuthHeaders()
      });

      if (!res.ok) {
        throw new Error(await readErrorMessage(res, 'Failed to download receipt/invoice'));
      }

      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fallbackName = `${invoice.document_number ?? invoice.serial_number ?? 'receipt-invoice'}.pdf`;

      link.href = href;
      link.download = fallbackName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(href);
    } catch (e) {
      downloadError = e instanceof Error ? e.message : 'Failed to download receipt/invoice';
    } finally {
      downloadLoading = false;
    }
  }

  /** @param {string} url */
  function openStructured(url) {
    if (!url) {
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  const detailFields = [
    { label: 'Document Number', key: 'document_number', kind: 'text' },
    { label: 'Serial Number', key: 'serial_number', kind: 'text' },
    { label: 'Total Amount', key: 'total_amount', kind: 'currency' },
    { label: 'Buyer Name', key: 'buyer_registered_name', kind: 'text' },
    { label: 'Buyer Address', key: 'buyer_address', kind: 'text' },
    { label: 'Buyer TIN', key: 'buyer_tin', kind: 'text' },
    { label: 'Seller VAT Registered', key: 'seller_vat_registered', kind: 'text' },
    { label: 'CAS Control Number', key: 'cas_control_number', kind: 'text' },
    { label: 'BIR Reference', key: 'bir_registration_reference', kind: 'text' },
    { label: 'VATable Sales', key: 'vatable_sales', kind: 'currency' },
    { label: 'VAT Amount (12%)', key: 'vat_amount', kind: 'currency' },
    { label: 'Zero-Rated Sale', key: 'zero_rated_sale', kind: 'currency' },
    { label: 'VAT-Exempt Sale', key: 'vat_exempt_sale', kind: 'currency' }
  ];
</script>

<section class="report-shell">
  <header class="report-header">
    <div>
      <h1>Receipt / Invoices</h1>
      <p>Browse generated records, then open a full invoice breakdown.</p>
    </div>
  </header>

  {#if error}
    <p class="status-message error">{error}</p>
  {:else if loading}
    <p class="status-message">Loading records...</p>
  {:else if items.length === 0}
    <p class="status-message">No receipt/invoice records found.</p>
  {:else}
    <div class="table-wrap">
      <table class="records-table">
        <thead>
          <tr>
            <th>Entry No</th>
            <th>Document No</th>
            <th>Date</th>
            <th>Book Type</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {#each items as item}
            <tr>
              <td>{safeValue(item.serial_number ?? item.entry_no)}</td>
              <td>{safeValue(item.document_number ?? item.reference_no)}</td>
              <td>{safeValue(item.transaction_date)}</td>
              <td>{safeValue(item.book_type)}</td>
              <td>{formatCurrency(item.total_amount)}</td>
              <td>
                <button class="action-chip" onclick={() => viewDetail(item.entry_id ?? item.id)}>
                  View Details
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}

  {#if detailLoading}
    <p class="status-message">Loading detail...</p>
  {:else if detailError}
    <p class="status-message error">{detailError}</p>
  {:else if selected}
    <section class="detail-card">
      <div class="detail-top">
        <button class="back-button" onclick={clearDetail}>Back to list</button>
        <div class="title-wrap">
          <h2>{safeValue(selected.document_title ?? 'Receipt / Invoice')}</h2>
          <p class="subtitle">
            {safeValue(selected.document_number)} · {safeValue(selected.serial_number)}
          </p>
        </div>
        <div class="detail-total">
          <span>Total</span>
          <strong>{formatCurrency(selected.total_amount)}</strong>
        </div>
      </div>

      <dl class="detail-grid">
        {#each detailFields as field}
          <div class="detail-item">
            <dt>{field.label}</dt>
            <dd>
              {#if field.kind === 'currency'}
                {formatCurrency(selected[field.key])}
              {:else}
                {safeValue(selected[field.key])}
              {/if}
            </dd>
          </div>
        {/each}
      </dl>

      <div class="button-row">
        <button class="primary" onclick={() => downloadInvoice(selected)} disabled={downloadLoading}>
          {downloadLoading ? 'Downloading...' : 'Download PDF'}
        </button>
        <button class="ghost" onclick={() => openStructured(getXmlUrl(selected))}>Open XML</button>
        <button class="ghost" onclick={() => openStructured(selected.structured_formats?.json ?? '')}>
          Open JSON
        </button>
      </div>

      {#if downloadError}
        <p class="status-message error">{downloadError}</p>
      {/if}

      {#if selected.item_rows && selected.item_rows.length > 0}
        <div class="table-wrap">
          <table class="items-table">
            <thead>
              <tr>
                <th>Particulars</th>
                <th>Debit</th>
                <th>Credit</th>
              </tr>
            </thead>
            <tbody>
              {#each selected.item_rows as row}
                <tr>
                  <td>{safeValue(row.particulars)}</td>
                  <td>{formatCurrency(row.debit_amount)}</td>
                  <td>{formatCurrency(row.credit_amount)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <p class="status-message">No line items.</p>
      {/if}
    </section>
  {/if}
</section>

<style>
  .report-shell {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 0.75rem;
  }

  h1 {
    margin: 0;
    font-size: clamp(1.45rem, 1.5vw + 1rem, 2rem);
    letter-spacing: -0.02em;
  }

  .report-header p {
    margin: 0.35rem 0 0;
    color: var(--md-sys-color-on-surface-variant);
  }

  .table-wrap {
    width: 100%;
    overflow-x: auto;
    border: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 76%, white);
    border-radius: 1rem;
    background: rgb(255 255 255 / 0.78);
  }

  .records-table,
  .items-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 720px;
  }

  th,
  td {
    padding: 0.8rem 0.85rem;
    text-align: left;
    border-bottom: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 64%, white);
  }

  th {
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--md-sys-color-on-surface-variant);
    background: rgb(216 226 255 / 0.45);
  }

  tbody tr:hover {
    background: rgb(216 226 255 / 0.16);
  }

  .action-chip {
    border: 0;
    border-radius: 999px;
    padding: 0.45rem 0.85rem;
    background: linear-gradient(120deg, var(--md-sys-color-primary), #204891);
    color: var(--md-sys-color-on-primary);
    font-weight: 600;
    cursor: pointer;
  }

  .detail-card {
    margin-top: 1rem;
    border: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 70%, white);
    border-radius: 1.2rem;
    padding: clamp(1rem, 0.8rem + 0.85vw, 1.45rem);
    background:
      radial-gradient(circle at top right, rgb(216 226 255 / 0.5), transparent 45%),
      linear-gradient(180deg, rgb(255 255 255 / 0.92), rgb(248 249 255 / 0.88));
    box-shadow: 0 8px 28px -22px rgb(12 26 56 / 0.45);
  }

  .detail-top {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.75rem 1rem;
    align-items: center;
  }

  .back-button {
    border: 0;
    border-radius: 999px;
    padding: 0.55rem 1rem;
    font-weight: 600;
    background: #355ca8;
    color: #fff;
    cursor: pointer;
  }

  .title-wrap h2 {
    margin: 0;
    font-size: clamp(1.2rem, 1.1vw + 0.85rem, 1.75rem);
  }

  .subtitle {
    margin: 0.35rem 0 0;
    color: var(--md-sys-color-on-surface-variant);
    font-size: 0.93rem;
  }

  .detail-total {
    display: grid;
    gap: 0.2rem;
    justify-items: end;
  }

  .detail-total span {
    color: var(--md-sys-color-on-surface-variant);
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }

  .detail-total strong {
    font-size: clamp(1.1rem, 0.7rem + 1.35vw, 1.55rem);
  }

  .detail-grid {
    margin: 1rem 0 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(240px, 1fr));
    gap: 0.7rem;
  }

  .detail-item {
    margin: 0;
    padding: 0.65rem 0.75rem;
    border-radius: 0.8rem;
    background: rgb(255 255 255 / 0.66);
    border: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 58%, white);
  }

  dt {
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--md-sys-color-on-surface-variant);
  }

  dd {
    margin: 0.35rem 0 0;
    font-weight: 600;
    font-size: 0.95rem;
    word-break: break-word;
  }

  .button-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin-top: 1rem;
    margin-bottom: 0.65rem;
  }

  .button-row button {
    border-radius: 0.65rem;
    border: 1px solid transparent;
    padding: 0.58rem 0.95rem;
    font-weight: 600;
    cursor: pointer;
  }

  .button-row .primary {
    color: #fff;
    background: linear-gradient(120deg, var(--md-sys-color-primary), #234d9b);
  }

  .button-row .ghost {
    color: var(--md-sys-color-on-primary-container);
    background: color-mix(in srgb, var(--md-sys-color-primary-container) 72%, white);
    border-color: color-mix(in srgb, var(--md-sys-color-primary) 24%, white);
  }

  .status-message {
    margin: 0.25rem 0;
    color: var(--md-sys-color-on-surface-variant);
  }

  .status-message.error {
    color: #8f1d1d;
    font-weight: 600;
  }

  @media (max-width: 900px) {
    .detail-top {
      grid-template-columns: 1fr;
      justify-items: start;
    }

    .detail-total {
      justify-items: start;
    }

    .detail-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .table-wrap {
      border-radius: 0.85rem;
    }

    th,
    td {
      padding: 0.68rem 0.65rem;
    }

    .button-row button,
    .back-button {
      width: 100%;
      justify-content: center;
    }
  }
</style>
