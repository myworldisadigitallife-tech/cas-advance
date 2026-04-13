<script>
  import { API_BASE, readErrorMessage } from '$lib/api';

  let username = '';
  let password = '';
  let error = '';

  async function login() {
    error = '';

    try {
      const res = await fetch(`${API_BASE}/auth/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        throw new Error(await readErrorMessage(res, 'Login failed'));
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);
      window.location.href = '/dashboard';
    } catch (e) {
      error = e instanceof Error ? e.message : 'Login failed';
    }
  }
</script>

<h1>Login</h1>
<form on:submit|preventDefault={login}>
  <input placeholder="Username" bind:value={username} required />
  <input type="password" placeholder="Password" bind:value={password} required />
  <button type="submit">Login</button>
  {#if error}<p style="color:red">{error}</p>{/if}
</form>
