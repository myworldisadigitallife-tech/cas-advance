<script>
  let constructionMessage = '';

  const reportLinks = [
    {
      href: '/reports/receipt-invoices',
      title: 'Receipt / Invoices',
      note: 'Open generated receipt and invoice artifacts.',
      group: 'Compliance',
      available: true
    },
    {
      href: '/reports/financial-statements',
      title: 'Financial Statements',
      note: 'Generate statement-ready summaries and totals.',
      group: 'Financials',
      available: true
    },
    {
      href: '/reports/journal',
      title: 'Journal Report',
      note: 'Chronological entries with source and posting detail.',
      group: 'Core',
      available: false
    },
    {
      href: '/reports/sales-journal',
      title: 'Sales Journal',
      note: 'Track sales invoices and taxable sales lines.',
      group: 'Sales',
      available: false
    },
    {
      href: '/reports/purchases-journal',
      title: 'Purchases Journal',
      note: 'Review purchase transactions and supplier activity.',
      group: 'Purchasing',
      available: false
    },
    {
      href: '/reports/inventory-book',
      title: 'Inventory Book',
      note: 'Monitor item movement and running balances.',
      group: 'Inventory',
      available: false
    },
    {
      href: '/reports/audit-trail',
      title: 'Audit Trail',
      note: 'Inspect user actions and system-generated events.',
      group: 'Compliance',
      available: false
    },
    {
      href: '/reports/tax-summary',
      title: 'Tax Summary',
      note: 'Summarize tax bases, rates, and tax due.',
      group: 'Tax',
      available: false
    },
    {
      href: '/reports/ledger',
      title: 'Ledger',
      note: 'Analyze account-level postings and balances.',
      group: 'Core',
      available: false
    },
    {
      href: '/reports/trial-balance',
      title: 'Trial Balance',
      note: 'Compare total debits and credits by account.',
      group: 'Core',
      available: false
    },
    {
      href: '/reports/system-generated',
      title: 'System Generated',
      note: 'View reports produced by background automations.',
      group: 'System',
      available: false
    }
  ];

  function handleCardClick(event, report) {
    if (report.available) {
      constructionMessage = '';
      return;
    }

    event.preventDefault();
    constructionMessage = `${report.title} is still under construction.`;
  }
</script>

<section class="reports-hub">
  <header class="hero">
    <p class="eyebrow">Reporting Workspace</p>
    <h1>Reports</h1>
    <p class="intro">
      Choose a report module below to review ledgers, tax outputs, compliance documents, and
      operational summaries.
    </p>
  </header>

  {#if constructionMessage}
    <p class="status-banner" role="status" aria-live="polite">{constructionMessage}</p>
  {/if}

  <div class="cards-grid">
    {#each reportLinks as report}
      <a
        class="report-card"
        class:under-construction={!report.available}
        href={report.href}
        on:click={(event) => handleCardClick(event, report)}
        aria-disabled={!report.available}
      >
        <span class="chip">{report.group}</span>
        <h2>{report.title}</h2>
        <p>{report.note}</p>
        <span class="cta">{report.available ? 'Open report' : 'Under construction'}</span>
      </a>
    {/each}
  </div>
</section>

<style>
  .reports-hub {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .hero {
    padding: clamp(1rem, 0.95rem + 0.7vw, 1.35rem);
    border-radius: 1.15rem;
    border: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 72%, white);
    background:
      radial-gradient(circle at 88% 14%, rgb(53 92 168 / 0.2), transparent 42%),
      linear-gradient(165deg, rgb(255 255 255 / 0.96), rgb(243 246 255 / 0.9));
  }

  .eyebrow {
    margin: 0;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.11em;
    color: var(--md-sys-color-on-surface-variant);
    font-weight: 700;
  }

  h1 {
    margin: 0.35rem 0 0;
    font-size: clamp(1.55rem, 1.5vw + 1rem, 2.25rem);
    letter-spacing: -0.02em;
  }

  .intro {
    margin: 0.65rem 0 0;
    color: var(--md-sys-color-on-surface-variant);
    max-width: 72ch;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(260px, 1fr));
    gap: 0.85rem;
  }

  .status-banner {
    margin: 0;
    padding: 0.62rem 0.85rem;
    border-radius: 0.75rem;
    border: 1px solid color-mix(in srgb, var(--md-sys-color-primary) 24%, white);
    background: color-mix(in srgb, var(--md-sys-color-primary-container) 66%, white);
    color: var(--md-sys-color-on-primary-container);
    font-size: 0.9rem;
    font-weight: 600;
  }

  .report-card {
    display: grid;
    gap: 0.55rem;
    padding: 0.95rem;
    border-radius: 0.95rem;
    border: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 66%, white);
    text-decoration: none;
    color: inherit;
    background: rgb(255 255 255 / 0.85);
    box-shadow: 0 4px 15px -12px rgb(20 24 31 / 0.26);
    transition: transform 130ms ease, box-shadow 130ms ease, border-color 130ms ease;
  }

  .report-card:hover {
    transform: translateY(-1px);
    border-color: color-mix(in srgb, var(--md-sys-color-primary) 36%, white);
    box-shadow: 0 14px 26px -20px rgb(18 34 68 / 0.45);
  }

  .report-card.under-construction {
    cursor: not-allowed;
  }

  .report-card.under-construction:hover {
    transform: none;
    border-color: color-mix(in srgb, var(--md-sys-color-outline-variant) 66%, white);
    box-shadow: 0 4px 15px -12px rgb(20 24 31 / 0.26);
  }

  .chip {
    width: fit-content;
    border-radius: 999px;
    padding: 0.22rem 0.55rem;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--md-sys-color-on-primary-container);
    background: color-mix(in srgb, var(--md-sys-color-primary-container) 70%, white);
  }

  h2 {
    margin: 0;
    font-size: 1.04rem;
    letter-spacing: -0.01em;
  }

  .report-card p {
    margin: 0;
    color: var(--md-sys-color-on-surface-variant);
    line-height: 1.45;
    font-size: 0.92rem;
  }

  .cta {
    font-size: 0.86rem;
    font-weight: 700;
    color: var(--md-sys-color-primary);
  }

  @media (max-width: 840px) {
    .cards-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .hero,
    .report-card {
      border-radius: 0.85rem;
    }
  }
</style>
