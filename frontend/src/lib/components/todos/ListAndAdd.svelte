<script lang="ts">
	import IconPlus from '@lucide/svelte/icons/plus';
	import { getKeyManager } from '$lib/KeyManager.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getTags } from '$lib/state/Tags.svelte';
	import { onDestroy, tick } from 'svelte';
	import SaveButton from '$lib/components/ui/buttons/SaveButton.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';

	let { title, type, onStart, onFinish } = $props<{
		title: string;
		type: 'tag' | 'category';
		onStart: () => void;
		onFinish: () => void;
	}>();

	const keyManager = getKeyManager();
	const loadingIndicator = getLoadingIndicator();
	const todos = getTodos();
	const tags = getTags();

	let visible = $state<boolean>(false);
	let value = $state<string>('');
	let input = $state<HTMLInputElement | null>(null);
	let keyHandlers = $state<{ [key: string]: string | null }>({ Enter: null, Escape: null });

	async function toggle(): Promise<void> {
		visible = !visible;

		if (visible) {
			await tick();
			input?.focus();

			keyHandlers.Enter = keyManager.registerKeyDown('Enter', handleEnter);
			keyHandlers.Escape = keyManager.registerKeyDown('Escape', handleEscape);
			onStart();
		}
	}

	function onblur(): void {
		visible = false;
		keyManager.unregisterAll(keyHandlers);
		onFinish();
	}

	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	async function handleEnter(event: KeyboardEvent): Promise<void> {
		await onsubmit();
	}

	function handleEscape(event: KeyboardEvent): void {
		onblur();
	}

	async function onsubmit(): Promise<void> {
		loadingIndicator.start();

		if (value.trim() === '') {
			return;
		}

		if (type === 'tag') {
			await tags.create(value);
		} else if (type === 'category') {
			await todos.createCategory(value);
		}

		value = '';
		visible = false;

		loadingIndicator.stop();
		keyManager.unregisterAll(keyHandlers);
		onFinish();
	}
</script>

<div
	class="mt-2 flex items-center justify-between p-2 text-base font-bold 2xl:text-2xl 2xl:font-normal"
>
	{title}
	<IconPlus
		class="cursor-pointer pt-1 text-c-neutral-5 hover:text-c-neutral-9 dark:text-c-neutral-2 dark:hover:text-white"
		onclick={toggle}
	/>
</div>
{#if visible}
	<div class="flex flex-row items-center space-x-2">
		<TextInput bind:input bind:value {onblur} />
		<SaveButton onClick={onsubmit} />
	</div>
{/if}
