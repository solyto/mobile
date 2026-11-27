import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { licenses } from './scripts/licenses';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), licenses()],
	optimizeDeps: {
		include: ['@thisux/sveltednd']
	},
	server: {
		port: 5173
	}
});
