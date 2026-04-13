import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
  prerender: {
    handleHttpError: ({ path, referrer, message }) => {
      // This tells SvelteKit: "Just log it, but don't stop the build"
      console.warn(`404 at ${path} (linked from ${referrer}): ${message}`);
      return; 
    }
  },    
    adapter: adapter({ fallback: '404.html' }),
    paths: {
      base: process.env.NODE_ENV === 'production' ? '/' : ''
    }
  }
};

export default config;