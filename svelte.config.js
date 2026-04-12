import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
  prerender: {
    handleHttpError: ({ path, message }) => {
      // Ignore API calls that fail during the static build
      if (path.startsWith('/api') || path.includes('your-api-url.com')) {
        return;
      }
      // If it's a real page link error, still throw it so you know
      throw new Error(message);
    }
  },    
    adapter: adapter({ fallback: '404.html' }),
    paths: {
      base: process.env.NODE_ENV === 'production' ? '/cas-advance' : ''
    }
  }
};

export default config;