<script lang="ts">
	import { tick, onDestroy } from 'svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getKeyManager } from '$lib/state/KeyManager.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import AddButton from '$lib/components/ui/buttons/AddButton.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const keyManager = getKeyManager();
	const loadingIndicator = getLoadingIndicator();
	const ts = getTranslation();

	let {
		label,
		create,
		buttonType = 'plain',
		useAddButton = false
	}: {
		label: string;
		create: (title: string) => unknown;
		buttonType?: 'plain' | 'slight' | 'btn';
		useAddButton?: boolean;
	} = $props();

	let formOpen = $state<boolean>(false);
	let title = $state<string>('');
	let input = $state<HTMLInputElement | null>(null);
	let keyHandlers: { [key: string]: string | null } = { Enter: null, Escape: null };

	async function toggleForm(): Promise<void> {
		formOpen = !formOpen;

		if (formOpen) {
			await tick();
			input?.focus();

			keyHandlers.Enter = keyManager.registerKeyDown('Enter', handleEnter);
			keyHandlers.Escape = keyManager.registerKeyDown('Escape', handleEscape);
		}
	}

	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	function onblur(): void {
		formOpen = false;
		keyManager.unregisterAll(keyHandlers);
	}

	async function handleEnter(event: KeyboardEvent): Promise<void> {
		loadingIndicator.start();
		try {
			if (title.trim() !== '') {
				await create(title);
				title = '';
			}

			await toggleForm();
			keyManager.unregisterAll(keyHandlers);
		} finally {
			loadingIndicator.stop();
		}
	}

	function handleEscape(event: KeyboardEvent): void {
		onblur();
	}
</script>

<div>
	{#if formOpen}
		<div class="w-48">
			<TextInput bind:input bind:value={title} {onblur} placeholder={ts.get.layout.name} />
		</div>
	{:else if useAddButton}
		<AddButton onClick={toggleForm} />
	{:else}
		<TextButton title="+ {label}" onclick={toggleForm} type={buttonType} />
	{/if}
</div>
