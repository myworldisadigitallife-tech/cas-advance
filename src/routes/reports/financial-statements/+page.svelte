<script>
  import { onMount } from 'svelte';
  import { API_BASE, buildAuthHeaders, readErrorMessage } from '$lib/api';

  /** @type {{ results?: any[] }} */
  let periodResponse = { results: [] };

  let startDate = '';
  let endDate = '';
  let periodId = '';
  let isVoided = 'false';
  let reportYear = '';

  /** @type {any | null} */
  let report = null;

  let loading = true;
  let applying = false;
  let periodLoading = true;
  let error = '';

  const PDF_FALLBACK_BASE = 'https://casadvance-digitallife11.pythonanywhere.com/reports/financial-statements/';

  const moneyFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  function safeText(value) {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    return String(value);
  }

  function formatMoney(value) {
    if (value === null || value === undefined || value === '') {
      return moneyFormatter.format(0);
    }

    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return safeText(value);
    }

    return moneyFormatter.format(numeric);
  }

  function boolValue(raw) {
    if (raw === 'true') {
      return true;
    }

    if (raw === 'false') {
      return false;
    }

    return undefined;
  }

  async function loadPeriods() {
    periodLoading = true;

    try {
      const res = await fetch(`${API_BASE}/periods/`, {
        headers: buildAuthHeaders()
      });

      if (!res.ok) {
        throw new Error(await readErrorMessage(res, 'Failed to load periods'));
      }

      const payload = await res.json();
      periodResponse = payload && typeof payload === 'object' ? payload : { results: [] };
    } catch {
      periodResponse = { results: [] };
    } finally {
      periodLoading = false;
    }
  }

  function buildQueryParams() {
    const query = new URLSearchParams();

    if (startDate) {
      query.set('start_date', startDate);
    }

    if (endDate) {
      query.set('end_date', endDate);
    }

    if (periodId) {
      query.set('period_id', periodId);
    }

    const voided = boolValue(isVoided);
    if (voided !== undefined) {
      query.set('is_voided', String(voided));
    }

    if (reportYear) {
      query.set('report_year', reportYear);
    }

    return query;
  }

  function buildQueryString() {
    const serialized = buildQueryParams().toString();
    return serialized ? `?${serialized}` : '';
  }

  function normalizePdfUrl(url) {
    if (!url || typeof url !== 'string') {
      return '';
    }

    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    if (url.startsWith('/')) {
      return `https://casadvance-digitallife11.pythonanywhere.com${url}`;
    }

    return url;
  }

  function getApiPdfUrl() {
    if (!report || typeof report !== 'object') {
      return '';
    }

    return normalizePdfUrl(
      report.download_url ??
        report.pdf_url ??
        report.financial_statement_pdf_url ??
        report.links?.pdf ??
        ''
    );
  }

  function buildFallbackPdfUrl() {
    const query = buildQueryParams();
    query.set('format', 'pdf');
    return `${PDF_FALLBACK_BASE}?${query.toString()}`;
  }

  function getResolvedPdfUrl() {
    return getApiPdfUrl() || buildFallbackPdfUrl();
  }

  function openPdfReport() {
    const url = getResolvedPdfUrl();
    if (!url) {
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  async function loadReport() {
    error = '';

    try {
      const queryString = buildQueryString();
      const res = await fetch(`${API_BASE}/reports/financial-statements/${queryString}`, {
        headers: buildAuthHeaders()
      });

      if (!res.ok) {
        throw new Error(await readErrorMessage(res, 'Failed to load financial statements'));
      }

      report = await res.json();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load financial statements';
      report = null;
    }
  }

  async function refreshReport(isInitialLoad = false) {
    if (isInitialLoad) {
      loading = true;
    } else {
      applying = true;
    }

    await loadReport();

    if (isInitialLoad) {
      loading = false;
    } else {
      applying = false;
    }
  }

  async function applyFilters(event) {
    event.preventDefault();
    await refreshReport(false);
  }

  async function resetFilters() {
    startDate = '';
    endDate = '';
    periodId = '';
    isVoided = 'false';
    reportYear = '';
    await refreshReport(false);
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  onMount(async () => {
    await Promise.all([loadPeriods(), refreshReport(true)]);
  });
</script>

<section class="financial-report-shell">
  <header class="page-head">
    <h1>Financial Statements</h1>
    <p>Review income statement and statement of financial position totals for your selected filters.</p>
  </header>

  <form class="filters-card" on:submit={applyFilters}>
    <div class="filters-grid">
      <label>
        <span>Start Date</span>
        <input type="date" bind:value={startDate} />
      </label>

      <label>
        <span>End Date</span>
        <input type="date" bind:value={endDate} />
      </label>

      <label>
        <span>Period</span>
        <select bind:value={periodId} disabled={periodLoading}>
          <option value="">All periods</option>
          {#each asArray(periodResponse.results) as period}
            <option value={safeText(period.id)}>
              {safeText(period.year)}-{safeText(period.month)}
            </option>
          {/each}
        </select>
      </label>

      <label>
        <span>Is Voided</span>
        <select bind:value={isVoided}>
          <option value="">All</option>
          <option value="false">Non-voided only</option>
          <option value="true">Voided only</option>
        </select>
      </label>

      <label>
        <span>Report Year</span>
        <input type="number" min="1900" max="2999" step="1" bind:value={reportYear} placeholder="YYYY" />
      </label>
    </div>

    <div class="filters-actions">
      <button class="primary" type="submit" disabled={applying}>{applying ? 'Applying...' : 'Apply Filters'}</button>
      <button class="ghost" type="button" on:click={resetFilters} disabled={applying}>Reset</button>
      <button class="ghost" type="button" on:click={openPdfReport} disabled={loading || applying}>
        Open PDF Report
      </button>
    </div>
  </form>

  {#if error}
    <p class="status-message error">{error}</p>
  {:else if loading}
    <p class="status-message">Loading financial statements...</p>
  {:else if !report}
    <p class="status-message">No report data available.</p>
  {:else}
    <section class="totals-grid">
      <article>
        <h2>Income Statement</h2>
        <dl>
          <div><dt>Gross Revenue</dt><dd>{formatMoney(report.gross_revenue)}</dd></div>
          <div><dt>Total Expense</dt><dd>{formatMoney(report.total_expense)}</dd></div>
          <div><dt>Net Income</dt><dd>{formatMoney(report.net_income)}</dd></div>
        </dl>
      </article>

      <article>
        <h2>Financial Position</h2>
        <dl>
          <div><dt>Total Assets</dt><dd>{formatMoney(report.total_assets)}</dd></div>
          <div><dt>Total Liabilities</dt><dd>{formatMoney(report.total_liabilities)}</dd></div>
          <div><dt>Total Equity</dt><dd>{formatMoney(report.total_equity)}</dd></div>
          <div>
            <dt>Total Liabilities and Equity</dt>
            <dd>{formatMoney(report.total_liabilities_and_equity)}</dd>
          </div>
        </dl>
      </article>
    </section>

    <section class="meta-card">
      <h2>Report Metadata</h2>
      <dl class="meta-grid">
        <div><dt>Registered Name</dt><dd>{safeText(report.taxpayer_registered_name)}</dd></div>
        <div><dt>Generated Address</dt><dd>{safeText(report.report_generated_address)}</dd></div>
        <div><dt>VAT/TIN</dt><dd>{safeText(report.vat_or_non_vat_tin)}</dd></div>
        <div><dt>Software Version</dt><dd>{safeText(report.software_name_version)}</dd></div>
        <div><dt>Generated By</dt><dd>{safeText(report.report_generated_by)}</dd></div>
        <div><dt>Generated Timestamp</dt><dd>{safeText(report.report_generated_timestamp)}</dd></div>
      </dl>
    </section>

    <section class="quarterly-card">
      <h2>Quarterly Reports ({safeText(report.quarter_report_year)})</h2>
      <div class="quarter-grid">
        {#each asArray(report.quarterly_reports) as quarter}
          <article>
            <h3>{safeText(quarter.quarter)}</h3>
            <p>{safeText(quarter.coverage)}</p>
            <dl>
              <div><dt>Deadline</dt><dd>{safeText(quarter.deadline)}</dd></div>
              <div><dt>Gross Revenue</dt><dd>{formatMoney(quarter.gross_revenue)}</dd></div>
              <div><dt>Total Expense</dt><dd>{formatMoney(quarter.total_expense)}</dd></div>
              <div><dt>Net Income</dt><dd>{formatMoney(quarter.net_income)}</dd></div>
            </dl>
          </article>
        {/each}
      </div>
    </section>

    <section class="table-grid">
      <article class="table-card">
        <h2>Income by Account</h2>
        {#if asArray(report.income_by_account).length === 0}
          <p class="empty-state">No records.</p>
        {:else}
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Account</th>
                  <th>Type</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {#each asArray(report.income_by_account) as row}
                  <tr>
                    <td>{safeText(row.account_code)}</td>
                    <td>{safeText(row.account_name)}</td>
                    <td>{safeText(row.account_type)}</td>
                    <td>{formatMoney(row.amount)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </article>

      <article class="table-card">
        <h2>Expense by Account</h2>
        {#if asArray(report.expense_by_account).length === 0}
          <p class="empty-state">No records.</p>
        {:else}
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Account</th>
                  <th>Type</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {#each asArray(report.expense_by_account) as row}
                  <tr>
                    <td>{safeText(row.account_code)}</td>
                    <td>{safeText(row.account_name)}</td>
                    <td>{safeText(row.account_type)}</td>
                    <td>{formatMoney(row.amount)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </article>

      <article class="table-card">
        <h2>Current Assets</h2>
        {#if asArray(report.current_assets).length === 0}
          <p class="empty-state">No records.</p>
        {:else}
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Account</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {#each asArray(report.current_assets) as row}
                  <tr>
                    <td>{safeText(row.account_code)}</td>
                    <td>{safeText(row.account_name)}</td>
                    <td>{formatMoney(row.amount)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </article>

      <article class="table-card">
        <h2>Noncurrent Assets</h2>
        {#if asArray(report.noncurrent_assets).length === 0}
          <p class="empty-state">No records.</p>
        {:else}
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Account</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {#each asArray(report.noncurrent_assets) as row}
                  <tr>
                    <td>{safeText(row.account_code)}</td>
                    <td>{safeText(row.account_name)}</td>
                    <td>{formatMoney(row.amount)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </article>

      <article class="table-card">
        <h2>Current Liabilities</h2>
        {#if asArray(report.current_liabilities).length === 0}
          <p class="empty-state">No records.</p>
        {:else}
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Account</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {#each asArray(report.current_liabilities) as row}
                  <tr>
                    <td>{safeText(row.account_code)}</td>
                    <td>{safeText(row.account_name)}</td>
                    <td>{formatMoney(row.amount)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </article>

      <article class="table-card">
        <h2>Noncurrent Liabilities</h2>
        {#if asArray(report.noncurrent_liabilities).length === 0}
          <p class="empty-state">No records.</p>
        {:else}
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Account</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {#each asArray(report.noncurrent_liabilities) as row}
                  <tr>
                    <td>{safeText(row.account_code)}</td>
                    <td>{safeText(row.account_name)}</td>
                    <td>{formatMoney(row.amount)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </article>

      <article class="table-card">
        <h2>Equity by Account</h2>
        {#if asArray(report.equity_by_account).length === 0}
          <p class="empty-state">No records.</p>
        {:else}
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Account</th>
                  <th>Type</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {#each asArray(report.equity_by_account) as row}
                  <tr>
                    <td>{safeText(row.account_code)}</td>
                    <td>{safeText(row.account_name)}</td>
                    <td>{safeText(row.account_type)}</td>
                    <td>{formatMoney(row.amount)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </article>
    </section>
  {/if}
</section>

<style>
  .financial-report-shell {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .page-head h1 {
    margin: 0;
    font-size: clamp(1.45rem, 1.4vw + 1rem, 2rem);
    letter-spacing: -0.02em;
  }

  .page-head p {
    margin: 0.35rem 0 0;
    color: var(--md-sys-color-on-surface-variant);
  }

  .filters-card,
  .meta-card,
  .quarterly-card,
  .table-card,
  .totals-grid article {
    border-radius: 1rem;
    border: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 74%, white);
    background: rgb(255 255 255 / 0.86);
    box-shadow: 0 5px 18px -16px rgb(17 25 40 / 0.4);
  }

  .filters-card {
    padding: 0.95rem;
    display: grid;
    gap: 0.75rem;
  }

  .filters-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(180px, 1fr));
    gap: 0.7rem;
  }

  label {
    display: grid;
    gap: 0.35rem;
  }

  label span {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--md-sys-color-on-surface-variant);
    font-weight: 600;
  }

  input,
  select {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 72%, white);
    border-radius: 0.62rem;
    padding: 0.52rem 0.62rem;
    background: #fff;
    color: inherit;
    font: inherit;
  }

  .filters-actions {
    display: flex;
    gap: 0.55rem;
    flex-wrap: wrap;
  }

  button {
    border: 1px solid transparent;
    border-radius: 0.65rem;
    padding: 0.54rem 0.9rem;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.72;
  }

  .primary {
    color: var(--md-sys-color-on-primary);
    background: linear-gradient(120deg, var(--md-sys-color-primary), #244f9e);
  }

  .ghost {
    color: var(--md-sys-color-on-primary-container);
    background: color-mix(in srgb, var(--md-sys-color-primary-container) 75%, white);
    border-color: color-mix(in srgb, var(--md-sys-color-primary) 28%, white);
  }

  .status-message {
    margin: 0;
    color: var(--md-sys-color-on-surface-variant);
  }

  .status-message.error {
    color: #8f1d1d;
    font-weight: 600;
  }

  .totals-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(260px, 1fr));
    gap: 0.75rem;
  }

  .totals-grid article {
    padding: 0.9rem;
  }

  h2 {
    margin: 0;
    font-size: 1.05rem;
  }

  dl {
    margin: 0.7rem 0 0;
    display: grid;
    gap: 0.5rem;
  }

  dt {
    color: var(--md-sys-color-on-surface-variant);
    font-size: 0.8rem;
    letter-spacing: 0.02em;
  }

  dd {
    margin: 0.12rem 0 0;
    font-weight: 700;
  }

  .meta-card,
  .quarterly-card,
  .table-card {
    padding: 0.95rem;
  }

  .meta-grid {
    margin-top: 0.8rem;
    grid-template-columns: repeat(2, minmax(240px, 1fr));
    gap: 0.7rem;
  }

  .quarter-grid {
    margin-top: 0.8rem;
    display: grid;
    grid-template-columns: repeat(2, minmax(240px, 1fr));
    gap: 0.7rem;
  }

  .quarter-grid article {
    border: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 70%, white);
    border-radius: 0.85rem;
    padding: 0.75rem;
    background: rgb(255 255 255 / 0.72);
  }

  .quarter-grid h3 {
    margin: 0;
    font-size: 0.98rem;
  }

  .quarter-grid p {
    margin: 0.3rem 0 0.6rem;
    font-size: 0.9rem;
    color: var(--md-sys-color-on-surface-variant);
  }

  .table-grid {
    display: grid;
    gap: 0.75rem;
    grid-template-columns: repeat(2, minmax(320px, 1fr));
  }

  .empty-state {
    margin: 0.7rem 0 0;
    color: var(--md-sys-color-on-surface-variant);
  }

  .table-wrap {
    width: 100%;
    overflow-x: auto;
    margin-top: 0.8rem;
    border-radius: 0.8rem;
    border: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 72%, white);
    background: rgb(255 255 255 / 0.75);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 520px;
  }

  th,
  td {
    text-align: left;
    padding: 0.65rem 0.7rem;
    border-bottom: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 66%, white);
  }

  th {
    font-size: 0.75rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--md-sys-color-on-surface-variant);
    background: rgb(216 226 255 / 0.45);
  }

  @media (max-width: 1024px) {
    .filters-grid {
      grid-template-columns: repeat(2, minmax(180px, 1fr));
    }

    .table-grid,
    .totals-grid,
    .meta-grid,
    .quarter-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .filters-grid {
      grid-template-columns: 1fr;
    }

    .filters-actions button {
      width: 100%;
    }

    .table-wrap {
      border-radius: 0.7rem;
    }

    th,
    td {
      padding: 0.62rem 0.58rem;
    }
  }
</style>
