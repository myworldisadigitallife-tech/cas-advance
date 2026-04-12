<script>
import { onMount } from 'svelte';
import { API_BASE, buildAuthHeaders, readErrorMessage } from '$lib/api';

/** @type {any | null} */
let data = null;
let error = '';

onMount(async () => {
  try {
    const res = await fetch(`${API_BASE}/dashboard/`, {
      headers: buildAuthHeaders()
    });

    if (!res.ok) {
      throw new Error(await readErrorMessage(res, 'Failed to load dashboard'));
    }

    data = await res.json();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load dashboard';
  }
});
</script>

<h1>Dashboard</h1>
{#if error}
  <p style="color:red">{error}</p>
{:else if !data}
  <p>Loading...</p>
{:else}
  <div>
    <p>Accounts: {data.accounts_count}</p>
    <p>Entries: {data.entries_count}</p>
    <h2>Recent Entries</h2>
    <ul>
      {#each data.recent_entries as entry}
        <li>{entry.description}</li>
      {/each}
    </ul>
  </div>
{/if}
