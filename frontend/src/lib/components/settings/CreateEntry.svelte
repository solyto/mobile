<script lang="ts">
	import { tick, onDestroy } from 'svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getKeyManager } from '$lib/KeyManager.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import AddButton from '$lib/components/ui/buttons/AddButton.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';

	const keyManager = getKeyManager();
	const loadingIndicator = getLoadingIndicator();

	let {
		label,
		create,
		buttonType = 'plain',
		useAddButton = false
	} = $props<{
		label: string;
		create: (title: string) => unknown;
		buttonType?: 'plain' | 'slight' | 'btn';
		useAddButton?: boolean;
	}>();

	let formOpen = $state<boolean>(false);
	let title = $state<string>('');
	let input = $state<HTMLInputElement | null>(null);
	let keyHandlers = $state<{ [key: string]: string | null }>({ Enter: null, Escape: null });

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
		if (title.trim() !== '') {
			await create(title);
			title = '';
		}

		await toggleForm();
		loadingIndicator.stop();
		keyManager.unregisterKeyDown(keyHandlers.Enter);
	}

	function handleEscape(event: KeyboardEvent): void {
		onblur();
	}
</script>

<div>
	{#if formOpen}
		<div class="w-48">
			<TextInput bind:input bind:value={title} {onblur} placeholder="Name" />
		</div>
	{:else if useAddButton}
		<AddButton onClick={toggleForm} />
	{:else}
		<TextButton title="+ {label}" onclick={toggleForm} type={buttonType} />
	{/if}
</div>
