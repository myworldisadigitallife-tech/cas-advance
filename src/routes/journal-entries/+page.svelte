<script>
import { onMount } from 'svelte';
import { API_BASE, buildAuthHeaders, readErrorMessage } from '$lib/api';

/** @type {{ results: any[] }} */
let entries = { results: [] };
let error = '';

onMount(async () => {
  try {
    const res = await fetch(`${API_BASE}/journal-entries/`, {
      headers: buildAuthHeaders()
    });

    if (!res.ok) {
      throw new Error(await readErrorMessage(res, 'Failed to load journal entries'));
    }

    entries = await res.json();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load journal entries';
  }
});
</script>

<h1>Journal Entries</h1>
{#if error}
  <p style="color:red">{error}</p>
{:else if !entries.results}
  <p>Loading...</p>
{:else}
  <ul>
    {#each entries.results as entry}
      <li>{entry.reference_no} - {entry.description} ({entry.transaction_date})</li>
    {/each}
  </ul>
{/if}
