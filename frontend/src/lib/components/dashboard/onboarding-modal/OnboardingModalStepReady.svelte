<script lang="ts">
	import { blur } from 'svelte/transition';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getPwaInstall } from '$lib/state/PwaInstall.svelte';
	import { getViewPoint } from '$lib/state/Viewpoint.svelte';
	import IconRocket from '@lucide/svelte/icons/rocket';
	import IconSmartphone from '@lucide/svelte/icons/smartphone';

	const ts = getTranslation();
	const pwa = getPwaInstall();
	const viewPoint = getViewPoint();

	let readyDescription = $derived(
		viewPoint.isDesktop
			? ts.get.welcome_tour.ready_description + ' ' + ts.get.welcome_tour.ready_description_desktop
			: ts.get.welcome_tour.ready_description
	);
</script>

<div class="text-center" in:blur={{ duration: 200 }}>
	<div
		class="mb-6 inline-flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-c-success/20 to-c-btn/20"
	>
		<IconRocket class="size-10 text-c-success" />
	</div>
	<h1 class="mb-2 text-3xl font-bold text-c-neutral-9 dark:text-white">
		{ts.get.welcome_tour.ready_title}
	</h1>
	<p class="mb-4 text-lg font-medium text-c-success">{ts.get.welcome_tour.ready_subtitle}</p>
	<p class="mx-auto max-w-md leading-relaxed text-c-neutral-6 dark:text-c-neutral-4">
		{readyDescription}
	</p>
</div>

{#if !pwa.installed}
	<div
		class="mt-6 flex flex-col gap-3 border-t border-c-neutral-1 pt-5 dark:border-s-dark-3"
		in:blur={{ duration: 200 }}
	>
		<p class="text-sm text-c-neutral-5 dark:text-c-neutral-4">
			{ts.get.welcome_tour.pwa_description}
		</p>
		{#if pwa.canInstall}
			<button
				class="flex w-fit cursor-pointer items-center gap-1.5 rounded-lg bg-c-neutral px-4 py-2 text-sm font-medium text-black transition-all hover:bg-c-neutral-1 dark:bg-s-dark-3 dark:text-white dark:hover:bg-s-dark"
				onclick={() => pwa.install()}
			>
				<IconSmartphone size={14} />
				{ts.get.welcome_tour.pwa_title}
			</button>
		{:else if pwa.isIos}
			<p class="text-sm text-c-neutral-5 dark:text-c-neutral-4">
				{ts.get.welcome_tour.pwa_ios_instruction}
			</p>
		{:else}
			<p class="text-sm text-c-neutral-5 dark:text-c-neutral-4">
				{ts.get.welcome_tour.pwa_browser_hint}
			</p>
		{/if}
	</div>
{/if}
