<script lang="ts">
	import { fade } from 'svelte/transition';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { urls } from '$lib/config/urls';
	import IconPiggyBank from '@lucide/svelte/icons/piggy-bank';
	import IconHandCoins from '@lucide/svelte/icons/hand-coins';
	import { goto } from '$app/navigation';
	import { getFinances } from '$lib/state/Finances.svelte';
	import type { FinancePage } from '$lib/types/finance';
	import { resolve } from '$app/paths';

	const ts = getTranslation();
	const finances = getFinances();
	const setActivePage = (type: FinancePage) => (finances.activePage = type);
</script>

<div
	class="absolute z-20 hidden h-full max-h-screen w-16 flex-col items-center gap-0 overflow-y-auto bg-c-bg py-2 text-sm drop-shadow-xl transition-all lg:relative lg:flex dark:border-r-1 dark:border-s-dark-2 dark:drop-shadow-sm dark:drop-shadow-s-dark-shadow"
	in:fade
>
	<button
		class="cursor-pointer border-r-2 p-4 transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
		class:border-c-border={finances.activePage !== 'wealth'}
		class:border-c-btn={finances.activePage === 'wealth'}
		onclick={() => {
			setActivePage('wealth');
			goto(resolve(urls.wealth));
		}}
		title={ts.get.finances.wealth}
	>
		<IconPiggyBank />
	</button>
	<button
		class="cursor-pointer border-r-2 p-4 transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
		class:border-c-border={finances.activePage !== 'budget'}
		class:border-c-btn={finances.activePage === 'budget'}
		onclick={() => {
			setActivePage('budget');
			goto(resolve(urls.budget));
		}}
		title={ts.get.finances.budget}
	>
		<IconHandCoins />
	</button>
</div>
