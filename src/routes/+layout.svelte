
<script>
import { base } from '$app/paths';

  import '@material/web/icon/icon.js';
  import '@material/web/ripple/ripple.js';
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import { getToken } from '$lib/api';

  let { children } = $props();

  let isAuthenticated = $state(false);

  onMount(() => {
    isAuthenticated = !!getToken();
  });

  const topLinks = [
    { href: '/ai-journal', label: 'AI journal', icon: 'auto_awesome' }
  ];

  const primaryLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: 'space_dashboard' },
    { href: '/reports', label: 'Reports', icon: 'query_stats' },
    { href: '/journal-entries', label: 'Journals', icon: 'book_2' },
    { href: '/periods', label: 'Periods', icon: 'calendar_month' },
    { href: '/tax-codes', label: 'Tax codes', icon: 'receipt_long' }
  ];

  const secondaryLinks = [];

  /** @param {string} href */
  function isActive(href) {
    const { pathname } = page.url;
    return pathname === href || pathname.startsWith(`${href}/`);
  }
</script>

<div class="app-shell">
  <aside class="rail-shell">
    <a class="brand-badge" href="/dashboard" aria-label="CAS home">
      <span class="brand-mark">C</span>
      <span class="brand-copy">
        <strong>CAS</strong>
        <span>Accounting Suite</span>
      </span>
    </a>

    <div class="rail-groups">
      <nav class="navigation-rail" aria-label="Top">
        {#each topLinks as item}
          <a
            class:active={isActive(item.href)}
            class="rail-link"
            href={item.href}
            aria-current={isActive(item.href) ? 'page' : undefined}
            title={item.label}
          >
            <span class="rail-icon-wrap">
              <md-icon>{item.icon}</md-icon>
              <md-ripple></md-ripple>
            </span>
            <span class="rail-label">{item.label}</span>
          </a>
        {/each}
        {#if isAuthenticated}
          <a
            class:active={isActive('/profile')}
            class="rail-link"
            href="/profile"
            aria-current={isActive('/profile') ? 'page' : undefined}
            title="Profile"
          >
            <span class="rail-icon-wrap">
              <md-icon>person</md-icon>
              <md-ripple></md-ripple>
            </span>
            <span class="rail-label">Profile</span>
          </a>
        {/if}
        {#if !isAuthenticated}
          <a
            class:active={isActive('/auth')}
            class="rail-link"
            href="/auth"
            aria-current={isActive('/auth') ? 'page' : undefined}
            title="Login"
          >
            <span class="rail-icon-wrap">
              <md-icon>lock</md-icon>
              <md-ripple></md-ripple>
            </span>
            <span class="rail-label">Login</span>
          </a>
        {/if}
      </nav>

      <nav class="navigation-rail secondary" aria-label="Primary">
        {#each primaryLinks as item}
          <a
            class:active={isActive(item.href)}
            class="rail-link"
            href={item.href}
            aria-current={isActive(item.href) ? 'page' : undefined}
            title={item.label}
          >
            <span class="rail-icon-wrap">
              <md-icon>{item.icon}</md-icon>
              <md-ripple></md-ripple>
            </span>
            <span class="rail-label">{item.label}</span>
          </a>
        {/each}
      </nav>

      <nav class="navigation-rail secondary" aria-label="Secondary">
        {#each secondaryLinks as item}
          <a
            class:active={isActive(item.href)}
            class="rail-link"
            href={item.href}
            aria-current={isActive(item.href) ? 'page' : undefined}
            title={item.label}
          >
            <span class="rail-icon-wrap">
              <md-icon>{item.icon}</md-icon>
              <md-ripple></md-ripple>
            </span>
            <span class="rail-label">{item.label}</span>
          </a>
        {/each}
      </nav>
    </div>
  </aside>

  <div class="content-shell">


    <main class="content-panel">
      {@render children?.()}
    </main>
  </div>
</div>

<style>
  :global(html) {
    background:
      radial-gradient(circle at top left, rgb(53 92 168 / 0.14), transparent 28%),
      linear-gradient(180deg, var(--md-sys-color-surface-container-low) 0%, var(--md-sys-color-surface) 42%);
    min-height: 100%;
  }

  :global(body) {
    margin: 0;
    min-height: 100vh;
    font-family: 'Roboto', sans-serif;
    color: var(--md-sys-color-on-surface);
    background: transparent;
  }

  :global(:root) {
    color-scheme: light;
    --md-sys-color-primary: #355ca8;
    --md-sys-color-on-primary: #ffffff;
    --md-sys-color-primary-container: #d8e2ff;
    --md-sys-color-on-primary-container: #001944;
    --md-sys-color-secondary: #555f71;
    --md-sys-color-secondary-container: #d9e3f8;
    --md-sys-color-on-secondary-container: #121c2b;
    --md-sys-color-surface: #f8f9ff;
    --md-sys-color-surface-container-low: #f3f4fc;
    --md-sys-color-on-surface: #1a1c20;
    --md-sys-color-on-surface-variant: #44474e;
    --md-sys-color-outline-variant: #c4c6d0;
    --md-sys-color-shadow: rgb(23 28 39 / 0.14);
    --md-icon-font: 'Material Symbols Rounded';
  }

  .app-shell {
    display: grid;
    grid-template-columns: 108px minmax(0, 1fr);
    min-height: 100vh;
    width: 100%;
  }

  .rail-shell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    padding: 1.5rem 0.75rem 1.1rem;
    background: color-mix(in srgb, var(--md-sys-color-surface-container-low) 85%, white);
    border-right: 1px solid var(--md-sys-color-outline-variant);
    backdrop-filter: blur(18px);
    position: sticky;
    top: 0;
    height: 100vh;
    max-width: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }

  .brand-badge {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.45rem;
    color: inherit;
    text-decoration: none;
  }

  .brand-mark {
    width: 3rem;
    height: 3rem;
    border-radius: 1rem;
    display: grid;
    place-items: center;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--md-sys-color-on-primary-container);
    background: linear-gradient(135deg, var(--md-sys-color-primary-container), #eef2ff);
    box-shadow: 0 10px 24px -18px var(--md-sys-color-shadow);
  }

  .brand-copy {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.125rem;
    text-align: center;
    font-size: 0.75rem;
    color: var(--md-sys-color-on-surface-variant);
  }

  .brand-copy strong {
    font-size: 0.875rem;
    line-height: 1.1;
    color: var(--md-sys-color-on-surface);
  }

  .rail-groups {
    width: 100%;
    display: block;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 0.15rem;
  }

  .navigation-rail {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .secondary {
    margin-top: 1rem;
    padding-bottom: 0.25rem;
  }

  .rail-link {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0;
    color: var(--md-sys-color-on-surface-variant);
    text-decoration: none;
    transition:
      color 160ms ease,
      transform 160ms ease;
  }

  .rail-link:hover {
    color: var(--md-sys-color-on-surface);
    transform: translateY(-1px);
  }

  .rail-icon-wrap {
    width: 3.5rem;
    height: 2rem;
    border-radius: 1rem;
    position: relative;
    display: grid;
    place-items: center;
    overflow: hidden;
    background: transparent;
    transition: background 160ms ease;
  }

  .rail-link:hover .rail-icon-wrap {
    background: rgb(53 92 168 / 0.08);
  }

  .rail-label {
    font-size: 0.75rem;
    line-height: 1rem;
    text-align: center;
  }

  .rail-link.active {
    color: var(--md-sys-color-on-secondary-container);
  }

  .rail-link.active .rail-icon-wrap {
    background: var(--md-sys-color-secondary-container);
  }

  .rail-link.active .rail-label {
    font-weight: 600;
  }

  .content-shell {
    min-width: 0;
    width: 100%;
    max-width: 1440px;
    margin: 0 auto;
    padding: 1.5rem 1.5rem 2rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    overflow-x: clip;
  }

  .top-app-bar {
    display: flex;
    justify-content: space-between;
    gap: 1.5rem;
    align-items: flex-end;
    padding: 0.5rem 0.5rem 0;
  }

  .eyebrow {
    margin: 0 0 0.35rem;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--md-sys-color-primary);
  }

  .top-app-bar h1 {
    margin: 0;
    font-size: clamp(1.85rem, 2vw + 1rem, 2.8rem);
    line-height: 1;
    letter-spacing: -0.04em;
  }

  .support-copy {
    max-width: 34rem;
    margin: 0;
    color: var(--md-sys-color-on-surface-variant);
    line-height: 1.5;
  }

  .content-panel {
    min-width: 0;
    min-height: 0;
    width: 100%;
    padding: clamp(1.15rem, 1.1vw + 0.95rem, 2rem);
    box-sizing: border-box;
    border: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 82%, white);
    border-radius: 1.75rem;
    background:
      linear-gradient(180deg, rgb(255 255 255 / 0.94), rgb(248 249 255 / 0.92)),
      var(--md-sys-color-surface);
    box-shadow:
      0 1px 2px rgb(20 24 31 / 0.06),
      0 16px 48px -34px rgb(20 24 31 / 0.25);
    overflow-x: auto;
  }

  .content-panel :global(h1),
  .content-panel :global(h2),
  .content-panel :global(h3) {
    color: var(--md-sys-color-on-surface);
  }

  .content-panel :global(p),
  .content-panel :global(li),
  .content-panel :global(label) {
    color: var(--md-sys-color-on-surface-variant);
    line-height: 1.55;
  }

  .content-panel :global(form) {
    display: grid;
    gap: 0.875rem;
  }

  .content-panel :global(ul),
  .content-panel :global(ol) {
    padding-left: 1.25rem;
  }

  .content-panel > :global(*) {
    max-width: 100%;
  }

  .content-panel :global(input),
  .content-panel :global(select),
  .content-panel :global(textarea) {
    border: 1px solid var(--md-sys-color-outline-variant);
    border-radius: 0.9rem;
    padding: 0.85rem 1rem;
    font: inherit;
    color: var(--md-sys-color-on-surface);
    background: white;
    box-sizing: border-box;
  }

  .content-panel :global(button) {
    border: none;
    border-radius: 999px;
    padding: 0.72rem 1.1rem;
    font: inherit;
    font-weight: 600;
    color: var(--md-sys-color-on-primary);
    background: var(--md-sys-color-primary);
    cursor: pointer;
  }

  .content-panel :global(button[type='button']) {
    color: var(--md-sys-color-on-secondary-container);
    background: var(--md-sys-color-secondary-container);
  }

  @media (max-width: 960px) {
    .app-shell {
      grid-template-columns: 1fr;
    }

    .rail-shell {
      position: static;
      top: auto;
      z-index: auto;
      height: auto;
      max-width: 100%;
      overflow: hidden;
      align-items: stretch;
      gap: 1rem;
      padding: 0.9rem 1rem 0.8rem;
      border-right: 0;
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
    }

    .brand-badge {
      width: auto;
      flex-direction: row;
      justify-content: flex-start;
    }

    .brand-copy {
      align-items: flex-start;
      text-align: left;
    }

    .rail-groups {
      display: block;
      width: 100%;
      max-width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
      touch-action: pan-x;
      padding-bottom: 0.15rem;
      white-space: nowrap;
      scrollbar-width: none;
      padding-right: 0;
    }

    .rail-groups::-webkit-scrollbar {
      display: none;
    }

    .navigation-rail,
    .secondary {
      width: max-content;
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      gap: 0.35rem;
      padding-bottom: 0;
    }

    .secondary {
      margin-top: 0;
      margin-left: 0.5rem;
      padding-left: 0.75rem;
      border-left: 1px solid var(--md-sys-color-outline-variant);
    }

    .rail-link {
      width: auto;
      min-width: 4.5rem;
      padding: 0.2rem 0;
    }

    .top-app-bar {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0;
    }

    .support-copy {
      max-width: none;
    }

    .content-shell {
      width: 100%;
      max-width: 100vw;
      margin: 0;
      padding: 1rem 0.85rem 1.35rem;
    }

    .content-panel {
      width: 100%;
      max-width: 100%;
      border-radius: 1.3rem;
      padding: 1rem;
    }
  }

  @media (max-width: 560px) {
    .brand-copy span {
      display: none;
    }

    .rail-link {
      min-width: 4.1rem;
    }

    .rail-label {
      font-size: 0.7rem;
    }

    .top-app-bar h1 {
      font-size: clamp(1.55rem, 7vw, 2rem);
    }
  }
</style>
