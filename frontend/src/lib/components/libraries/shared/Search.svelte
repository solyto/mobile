<script lang="ts">
	import { fade } from 'svelte/transition';
	import IconSearch from '@lucide/svelte/icons/search';
	import IconCircleX from '@lucide/svelte/icons/circle-x';
	import { onDestroy, onMount, tick } from 'svelte';
	import { getKeyManager } from '$lib/KeyManager.svelte';
	import type { Library } from '$lib/types/library';

	const keyManager = getKeyManager();

	let { library } = $props<{ library: Library }>();

	let inputExpanded = $state<boolean>(false);
	let searchInput = $state<HTMLInputElement | null>(null);
	let searchTerm = $state<string>('');
	let keyHandlers = $state<{ [key: string]: string | null }>({ f: null, Escape: null });

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
			searchTerm = '';
			library.search('');
		}, 200);

		keyManager.unregisterKeyDown(keyHandlers.Escape);
	}

	const oninput = () => library.search(searchTerm);
</script>

<button class="cursor-pointer" onclick={openSearch}>
	<IconSearch />
</button>

{#if library.searchVisible}
	<div class="absolute z-30 flex w-full justify-center">
		<input
			type="text"
			class="w-0 rounded-xl border-1 border-c-neutral-2 bg-transparent text-xl backdrop-blur-xs transition-all duration-300"
			class:w-72={inputExpanded}
			class:md:w-96={inputExpanded}
			in:fade
			bind:this={searchInput}
			bind:value={library.searchTerm}
			{oninput}
		/>
		<button
			class="z-20 ml-[-30px] cursor-pointer text-c-neutral-3 hover:text-c-neutral-5"
			onclick={closeSearch}
		>
			<IconCircleX />
		</button>
	</div>
{/if}
