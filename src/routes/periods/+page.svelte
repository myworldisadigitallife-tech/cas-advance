<script>
import { onMount } from 'svelte';
import { API_BASE, buildAuthHeaders, readErrorMessage } from '$lib/api';

/** @type {{ results: any[] }} */
let periods = { results: [] };
let error = '';

onMount(async () => {
  try {
    const res = await fetch(`${API_BASE}/periods/`, {
      headers: buildAuthHeaders()
    });

    if (!res.ok) {
      throw new Error(await readErrorMessage(res, 'Failed to load periods'));
    }

    periods = await res.json();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load periods';
  }
});
</script>

<h1>Accounting Periods</h1>
{#if error}
  <p style="color:red">{error}</p>
{:else if !periods.results}
  <p>Loading...</p>
{:else}
  <ul>
    {#each periods.results as period}
      <li>{period.year}-{period.month}</li>
    {/each}
  </ul>
{/if}
