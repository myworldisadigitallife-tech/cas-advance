<script>
import '@material/web/chips/assist-chip.js';
import '@material/web/button/filled-button.js';
import '@material/web/progress/circular-progress.js';
import { API_BASE, buildAuthHeaders, readErrorMessage } from '$lib/api';
import { tick } from 'svelte';

let text = '';
/** @type {any | null} */
let result = null;
let error = '';
let isLoading = false;
/** @type {HTMLTextAreaElement | null} */
let transactionInput = null;

const presetGroups = [
  {
    title: 'RECEIVE / INCOME',
    options: [
      'Cash income (service): Client paid 400 for services in cash',
      'Owner capital contribution: Owner invested 10,000 cash as capital',
      'Bank loan received: Borrowed 10,000 from bank',
      'Bank credit line drawdown: Received 25,000 from approved bank credit line',
      'Bank loan proceeds: Received 50,000 loan proceeds from bank'
    ]
  },
  {
    title: 'CREDIT / PAYABLE',
    options: [
      'Supplies purchase on credit: Bought office supplies for 3,000 on credit',
      'Inventory purchase on credit (A/P): Bought inventory for 8,000 on credit (accounts payable)',
      'Credit balance payment: Paid 5,500 credit balance to bank'
    ]
  },
  {
    title: 'CASH / PAYMENTS / EXPENSES',
    options: [
      'Internet expense (cash): Paid 50 for internet in cash',
      'Travel expense (cash): Paid 5,000 for airfare in cash',
      'Asset purchase (cash): Bought a laptop for 10,000 and paid in cash',
      'Loan repayment (cash): Paid 500 for land loan principal in cash',
      'Bank loan payment (cash): Paid 2,000 of bank loan in cash',
      'Bank credit payment (cash): Paid 3,000 of bank credit in cash',
      'Loan installment (cash): Paid 4,500 loan installment in cash',
      'Supplier debt payment (cash): Paid 6,000 debt to supplier in cash',
      'Tax payment: Paid 300 for percentage tax'
    ]
  }
];

/** @param {string} value */
async function applyPreset(value) {
  text = value;
  await tick();

  if (!transactionInput) {
    return;
  }

  transactionInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  transactionInput.focus();
}

async function generate() {
  if (isLoading) {
    return;
  }

  const shouldGenerate = window.confirm('Generate a journal entry from this transaction?');
  if (!shouldGenerate) {
    return;
  }

  isLoading = true;
  error = '';
  result = null;

  try {
    const res = await fetch(`${API_BASE}/ai/journal-entries/`, {
      method: 'POST',
      headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ transaction_text: text })
    });

    if (!res.ok) {
      throw new Error(await readErrorMessage(res, 'Failed to generate entry'));
    }

    result = await res.json();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to generate entry';
  } finally {
    isLoading = false;
  }
}
</script>


<section class="preset-panel" aria-label="Transaction presets">
  {#each presetGroups as group}
    <div class="preset-group">
      <h3>{group.title}</h3>
      <div class="chip-grid">
        {#each group.options as option}
          <md-assist-chip
            label={option}
            role="button"
            tabindex="0"
            on:click={() => applyPreset(option)}
            on:keydown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                applyPreset(option);
              }
            }}
          ></md-assist-chip>
        {/each}
      </div>
    </div>
  {/each}
</section>

<form on:submit|preventDefault={generate} aria-busy={isLoading}>
  <textarea
    bind:this={transactionInput}
    bind:value={text}
    placeholder="Describe the transaction..."
  ></textarea>
  <md-filled-button type="submit" disabled={isLoading}>
    {isLoading ? 'Generating...' : 'Generate'}
  </md-filled-button>
</form>
{#if isLoading}
  <p>
    <md-circular-progress indeterminate></md-circular-progress>
    Generating entry, please wait...
  </p>
{/if}
{#if error}
  <p>{error}</p>
{:else if result}
  <pre>{JSON.stringify(result, null, 2)}</pre>
{/if}

<style>
  h1 {
    margin: 0 0 1rem;
    font-size: clamp(2rem, 1.7rem + 1.2vw, 2.7rem);
    line-height: 1.05;
    letter-spacing: -0.03em;
  }

  .preset-panel {
    background: transparent;
    border: 0;
    border-radius: 0;
    overflow: visible;
    margin-bottom: 1rem;
    display: grid;
    gap: 1rem;
  }

  .preset-header {
    padding: 1.3rem 1.2rem 1.05rem;
    border-bottom: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 70%, white);
  }

  .preset-header h2 {
    margin: 0;
    font-size: clamp(1.5rem, 1.25rem + 0.8vw, 2rem);
    letter-spacing: -0.02em;
  }

  .preset-header p {
    margin: 0.35rem 0 0;
    font-size: 1.02rem;
    color: var(--md-sys-color-on-surface-variant);
  }

  .preset-group {
    padding: 0;
    border: 0;
  }

  .preset-group h3 {
    margin: 0 0 0.7rem;
    font-size: 1.05rem;
    letter-spacing: 0.01em;
  }

  .chip-grid {
    display: grid;
    gap: 0.5rem;
  }

  .chip-grid :global(md-assist-chip) {
    max-width: 100%;
    width: fit-content;
  }

  form {
    margin-top: 0.2rem;
  }

  textarea {
    width: 100%;
    min-height: 7.5rem;
    resize: vertical;
  }

  @media (max-width: 700px) {
    .preset-group {
      padding: 0;
    }

    .chip-grid :global(md-assist-chip) {
      width: 100%;
    }
  }
</style>
