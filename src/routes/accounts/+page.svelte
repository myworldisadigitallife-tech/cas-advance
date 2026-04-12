<script>
import { onMount } from 'svelte';
import { API_BASE, buildAuthHeaders, readErrorMessage } from '$lib/api';

/** @type {{ results: any[] }} */
let accounts = { results: [] };
let error = '';

onMount(async () => {
  try {
    const res = await fetch(`${API_BASE}/accounts/`, {
      headers: buildAuthHeaders()
    });

    if (!res.ok) {
      throw new Error(await readErrorMessage(res, 'Failed to load accounts'));
    }

    accounts = await res.json();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load accounts';
  }
});
</script>

<h1>Accounts</h1>
{#if error}
  <p style="color:red">{error}</p>
{:else if !accounts.results}
  <p>Loading...</p>
{:else}
  <ul>
    {#each accounts.results as account}
      <li>{account.code} - {account.name} ({account.account_type})</li>
    {/each}
  </ul>
{/if}
