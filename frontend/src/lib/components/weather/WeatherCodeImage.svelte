<script lang="ts">
	import { fade } from 'svelte/transition';
	import IconCloudSun from '@lucide/svelte/icons/cloud-sun';

	const imageModules = import.meta.glob('$lib/assets/weather/*.png', {
		eager: true,
		query: '?url',
		import: 'default'
	}) as Record<string, string>;

	const WEATHER_IMAGE_URLS: Record<string, string> = Object.fromEntries(
		Object.entries(imageModules).map(([path, url]) => {
			const filename = path.split('/').pop() || '';
			const code = filename.replace('.png', '');
			return [code, url];
		})
	);

	let { code } = $props<{ code: number }>();

	let src = $derived<string | null>(WEATHER_IMAGE_URLS[String(code)] ?? null);
</script>

{#if src}
	<img {src} alt="Weather code {code}" transition:fade />
{:else}
	<IconCloudSun class="size-12 text-c-neutral-4" />
{/if}
