<script>
import { onMount } from 'svelte';
import { API_BASE, buildAuthHeaders, readErrorMessage } from '$lib/api';

/** @type {{ results: any[] }} */
let logs = { results: [] };
let error = '';

onMount(async () => {
  try {
    const res = await fetch(`${API_BASE}/audit-logs/`, {
      headers: buildAuthHeaders()
    });

    if (!res.ok) {
      throw new Error(await readErrorMessage(res, 'Failed to load audit logs'));
    }

    logs = await res.json();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load audit logs';
  }
});
</script>

<h1>Audit Logs</h1>
{#if error}
  <p style="color:red">{error}</p>
{:else if !logs.results}
  <p>Loading...</p>
{:else}
  <ul>
    {#each logs.results as log}
      <li>{log.id} - {log.action} ({log.timestamp})</li>
    {/each}
  </ul>
{/if}
