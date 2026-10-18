<script lang="ts">
	import NavIndicator from '$lib/components/ui/NavIndicator.svelte';
	import { fade } from 'svelte/transition';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { urls } from '$lib/config/urls';
	import IconLayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import IconPiggyBank from '@lucide/svelte/icons/piggy-bank';
	import IconHandCoins from '@lucide/svelte/icons/hand-coins';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	const ts = getTranslation();
</script>

<div
	class="absolute z-20 hidden h-full max-h-screen w-16 flex-col items-center gap-0 overflow-y-auto bg-c-bg py-2 text-sm drop-shadow-xl transition-all lg:relative lg:flex dark:border-r-1 dark:border-s-dark-2 dark:drop-shadow-sm dark:drop-shadow-s-dark-shadow"
	in:fade
>
	<button
		class="relative flex w-full cursor-pointer justify-center p-4 transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
		onclick={() => goto(resolve(urls.finances))}
		title={ts.get.finances.dashboard}
	>
		<IconLayoutDashboard />
		<NavIndicator active={page.url.pathname === urls.finances} />
	</button>
	<button
		class="relative flex w-full cursor-pointer justify-center p-4 transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
		onclick={() => goto(resolve(urls.wealth))}
		title={ts.get.finances.wealth}
	>
		<IconPiggyBank />
		<NavIndicator active={page.url.pathname === urls.wealth} />
	</button>
	<button
		class="relative flex w-full cursor-pointer justify-center p-4 transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
		onclick={() => goto(resolve(urls.budget))}
		title={ts.get.finances.budget}
	>
		<IconHandCoins />
		<NavIndicator active={page.url.pathname === urls.budget} />
	</button>
</div>
