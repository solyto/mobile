<script lang="ts">
	import NavIndicator from '$lib/components/ui/NavIndicator.svelte';
	import { fade } from 'svelte/transition';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { urls } from '$lib/config/urls';
	import IconLayoutDashboard from '$lib/icons/lucide/layout-dashboard.svelte';
	import IconPiggyBank from '$lib/icons/lucide/piggy-bank.svelte';
	import IconHandCoins from '$lib/icons/lucide/hand-coins.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	const ts = getTranslation();

	const entries = [
		{ url: urls.finances, titleKey: 'dashboard', icon: IconLayoutDashboard },
		{ url: urls.wealth, titleKey: 'wealth', icon: IconPiggyBank },
		{ url: urls.budget, titleKey: 'budget', icon: IconHandCoins }
	] as const;
</script>

<div
	class="absolute z-20 hidden h-full max-h-screen w-16 flex-col items-center gap-0 overflow-y-auto bg-c-bg py-2 text-sm drop-shadow-xl transition-all lg:relative lg:flex dark:border-r-1 dark:border-s-dark-2 dark:drop-shadow-sm dark:drop-shadow-s-dark-shadow"
	in:fade
>
	{#each entries as entry (entry.url)}
		<button
			class="relative flex w-full cursor-pointer justify-center p-4 transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
			onclick={() => goto(resolve(entry.url))}
			title={ts.get.finances[entry.titleKey]}
		>
			<entry.icon />
			<NavIndicator active={page.url.pathname === entry.url} />
		</button>
	{/each}
</div>
