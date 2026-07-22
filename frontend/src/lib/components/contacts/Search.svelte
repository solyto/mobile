<script lang="ts">
	import { fade } from 'svelte/transition';
	import IconCircleX from '@lucide/svelte/icons/circle-x';
	import IconSearch from '@lucide/svelte/icons/search';
	import { onDestroy, onMount, tick } from 'svelte';
	import { getContacts } from '$lib/state/Contacts.svelte';
	import { getKeyManager } from '$lib/KeyManager.svelte';

	const contacts = getContacts();
	const keyManager = getKeyManager();

	let searchVisible = $state(false);
	let searchInput = $state<HTMLInputElement | null>(null);
	let searchTerm = $state<string>('');
	let keyHandlers = $state<{ [key: string]: string | null }>({ f: null, Escape: null });

	onMount(() => {
		keyHandlers.f = keyManager.registerKeyDown('f', toggleSearch, { withHelperKey: 'Control' });
		keyHandlers.Escape = keyManager.registerKeyDown('Escape', clearSearch);
	});
	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	async function toggleSearch() {
		searchVisible = !searchVisible;
		if (searchVisible) {
			await tick();
			searchInput?.focus();
		}
	}

	function clearSearch() {
		contacts.clearSearch();
	}

	function oninput() {
		contacts.search(searchTerm);
	}
</script>

<button class="cursor-pointer max-md:hidden" onclick={toggleSearch}>
	<IconSearch />
</button>

{#if searchVisible}
	<div class="absolute top-6 flex w-full justify-center">
		<input
			type="text"
			class="w-0 rounded-xl border-1 border-c-neutral-2 bg-white text-xl transition-all duration-300 dark:bg-s-dark"
			class:w-96={searchVisible}
			in:fade
			bind:this={searchInput}
			bind:value={searchTerm}
			{oninput}
		/>
		<button
			class="z-20 ml-[-30px] cursor-pointer text-c-neutral-3 hover:text-c-neutral-5"
			onclick={toggleSearch}
		>
			<IconCircleX />
		</button>
	</div>
{/if}
