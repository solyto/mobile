import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

const alias = { $lib: resolve('./src/lib') };

export default defineConfig({
	test: {
		projects: [
			{
				plugins: [sveltekit()],
				resolve: { alias },
				test: {
					name: 'unit',
					include: ['tests/unit/**/*.test.ts'],
					exclude: ['tests/unit/stores/**'],
					environment: 'node',
					env: { TZ: 'UTC' }
				}
			},
			{
				plugins: [sveltekit()],
				resolve: { alias },
				test: {
					name: 'stores',
					include: ['tests/unit/stores/**/*.test.ts'],
					environment: 'node',
					env: { TZ: 'UTC' },
					setupFiles: ['tests/unit/setup/storeMocks.ts']
				}
			},
			{
				plugins: [sveltekit()],
				resolve: { alias, conditions: ['browser'] },
				test: {
					name: 'components',
					include: ['tests/components/**/*.test.ts'],
					environment: 'jsdom',
					env: { TZ: 'UTC' },
					setupFiles: ['tests/setup/component.ts']
				}
			}
		],
		coverage: {
			provider: 'v8',
			include: ['src/lib/**'],
			exclude: [
				'src/lib/types/**',
				'src/lib/assets/**',
				'src/lib/i18n/**',
				'src/lib/config/apiRoutes.ts',
				'src/lib/config/themes.ts'
			]
		}
	}
});
