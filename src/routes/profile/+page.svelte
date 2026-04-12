<script>
import { onMount } from 'svelte';
import { API_BASE, buildAuthHeaders, readErrorMessage } from '$lib/api';

/** @type {any | null} */
let profile = null;
let error = '';
let editing = false;
/** @type {any} */
let form = {};

onMount(async () => {
  try {
    const res = await fetch(`${API_BASE}/profile/`, {
      headers: buildAuthHeaders()
    });

    if (!res.ok) {
      throw new Error(await readErrorMessage(res, 'Failed to load profile'));
    }

    profile = await res.json();
    form = { ...profile };
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load profile';
  }
});

async function save() {
  error = '';

  try {
    const res = await fetch(`${API_BASE}/profile/`, {
      method: 'PATCH',
      headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(form)
    });

    if (!res.ok) {
      throw new Error(await readErrorMessage(res, 'Failed to update profile'));
    }

    editing = false;
    profile = await res.json();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to update profile';
  }
}
</script>

<h1>Profile</h1>
{#if error}
  <p style="color:red">{error}</p>
{:else if !profile}
  <p>Loading...</p>
{:else}
  {#if editing}
    <form on:submit|preventDefault={save}>
      <input bind:value={form.business_name} placeholder="Business Name" />
      <input bind:value={form.trade_name} placeholder="Trade Name" />
      <input bind:value={form.registered_name} placeholder="Registered Name" />
      <input bind:value={form.vat_status} placeholder="VAT Status" />
      <input bind:value={form.tin_branch} placeholder="TIN Branch" />
      <input bind:value={form.registered_address} placeholder="Registered Address" />
      <button type="submit">Save</button>
      <button type="button" on:click={() => editing = false}>Cancel</button>
    </form>
  {:else}
    <div>
      <p>Business Name: {profile.business_name}</p>
      <p>Trade Name: {profile.trade_name}</p>
      <p>Registered Name: {profile.registered_name}</p>
      <p>VAT Status: {profile.vat_status}</p>
      <p>TIN Branch: {profile.tin_branch}</p>
      <p>Registered Address: {profile.registered_address}</p>
      <button on:click={() => editing = true}>Edit</button>
    </div>
  {/if}
{/if}
