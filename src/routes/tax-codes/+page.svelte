<script>
import { onMount } from 'svelte';
import { API_BASE, buildAuthHeaders, readErrorMessage } from '$lib/api';

/** @type {{ results: any[] }} */
let taxCodes = { results: [] };
let error = '';

onMount(async () => {
  try {
    const res = await fetch(`${API_BASE}/tax-codes/`, {
      headers: buildAuthHeaders()
    });

    if (!res.ok) {
      throw new Error(await readErrorMessage(res, 'Failed to load tax codes'));
    }

    taxCodes = await res.json();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load tax codes';
  }
});
</script>

<h1>Tax Codes</h1>
{#if error}
  <p style="color:red">{error}</p>
{:else if !taxCodes.results}
  <p>Loading...</p>
{:else}
  <ul>
    {#each taxCodes.results as code}
      <li>{code.code} - {code.description} ({code.rate}%)</li>
    {/each}
  </ul>
{/if}
