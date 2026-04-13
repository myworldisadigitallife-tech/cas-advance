<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';

  onMount(() => {
    // This automatically moves the user from 'casadvance.shop/' to 'casadvance.shop/dashboard/'
    goto(`${base}/dashboard/`, { replaceState: true });
  });
</script>

<div class="loading-screen">
  <p>Loading Dashboard...</p>
</div>

<style>
  .loading-screen {
    display: grid;
    place-items: center;
    height: 60vh;
    font-family: 'Roboto', sans-serif;
    color: var(--md-sys-color-on-surface-variant);
  }
</style>
