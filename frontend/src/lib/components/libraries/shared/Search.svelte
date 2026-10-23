<script lang="ts">
	import { fade } from 'svelte/transition';
	import IconSearch from '@lucide/svelte/icons/search';
	import IconCircleX from '@lucide/svelte/icons/circle-x';
	import { onDestroy, onMount, tick } from 'svelte';
	import { getKeyManager } from '$lib/state/KeyManager.svelte';
	import type { Library } from '$lib/types/library';

	const keyManager = getKeyManager();

	let { library }: { library: Library } = $props();

	let inputExpanded = $state<boolean>(false);
	let searchInput = $state<HTMLInputElement | null>(null);
	let keyHandlers: { [key: string]: string | null } = { f: null, Escape: null };

	onMount(
		() =>
			(keyHandlers.f = keyManager.registerKeyDown('f', openSearch, {
				withHelperKey: 'Control'
			}))
	);
	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	async function openSearch(): Promise<void> {
		if (library.createModalVisible) {
			return;
		}

		library.searchVisible = true;

		setTimeout(async () => {
			inputExpanded = true;
			await tick();
			searchInput?.focus();
		}, 50);

		keyHandlers.Escape = keyManager.registerKeyDown('Escape', closeSearch);
	}

	function closeSearch(): void {
		inputExpanded = false;
		setTimeout(() => {
			library.searchVisible = false;
			library.search();
		}, 200);

		keyManager.unregisterKeyDown(keyHandlers.Escape);
	}

	const oninput = () => library.search();
</script>

<button class="cursor-pointer" onclick={openSearch}>
	<IconSearch />
</button>

{#if library.searchVisible}
	<div class="pointer-events-none absolute z-30 flex w-full justify-center">
		<input
			type="text"
			class="pointer-events-auto w-0 rounded-xl border-1 border-c-neutral-2 !bg-c-neutral/60 text-xl backdrop-blur-sm transition-all duration-300 dark:!bg-s-dark/80"
			class:w-72={inputExpanded}
			class:md:w-96={inputExpanded}
			in:fade
			bind:this={searchInput}
			bind:value={library.searchTerm}
			{oninput}
		/>
		<button
			class="pointer-events-auto z-20 ml-[-30px] cursor-pointer text-c-neutral-3 hover:text-c-neutral-5"
			onclick={closeSearch}
		>
			<IconCircleX />
		</button>
	</div>
{/if}
