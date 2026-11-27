<script lang="ts">
	import { tick } from 'svelte';
	import { fade } from 'svelte/transition';
	import { getKeyManager } from '$lib/state/KeyManager.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getTags } from '$lib/state/Tags.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import SettingsButton from '$lib/components/ui/buttons/SettingsButton.svelte';
	import InlineAutocomplete from '$lib/components/forms/InlineAutocomplete.svelte';
	import { getViewPoint } from '$lib/state/Viewpoint.svelte';
	import BottomSheetModal from '$lib/components/ui/BottomSheetModal.svelte';
	import { getDueDateSuggestions } from '$lib/helpers/TodoHelper';

	const keyManager = getKeyManager();
	const todos = getTodos();
	const tags = getTags();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();
	const ts = getTranslation();
	const viewPoint = getViewPoint();

	let formOpen = $state<boolean>(false);
	let userInput = $state<string>('');
	let input = $state<HTMLInputElement | null>(null);
	let autocompleteOpen = $state<boolean>(false);
	let keyHandlers: { [key: string]: string | null } = { Enter: null, Escape: null };

	const recurrenceOptions = [
		{ label: ts.get.todos.recurrence_daily, value: 'daily' },
		{ label: ts.get.todos.recurrence_weekly, value: 'weekly' },
		{ label: ts.get.todos.recurrence_monthly, value: 'monthly' },
		{ label: ts.get.todos.recurrence_yearly, value: 'yearly' }
	];

	const syntaxHints = [
		{ prefix: '/', label: ts.get.todos.category },
		{ prefix: '#', label: ts.get.todos.tag },
		{ prefix: 'due:', label: ts.get.todos.due_date },
		{ prefix: 'repeat:', label: ts.get.todos.recurrence },
		{ prefix: 'link:', label: ts.get.todos.link }
	];

	const autocompleteTriggers = $derived([
		{ prefix: '#', items: tags.tags.map((t) => ({ label: t.name })) },
		{ prefix: '/', items: todos.categories.map((c) => ({ label: c.title })) },
		{ prefix: 'due:', items: getDueDateSuggestions(new Date(), ts.get.todos, ts.get.calendar.weekdays) },
		{ prefix: 'repeat:', items: recurrenceOptions }
	]);

	onMount(() => (keyHandlers.Enter = keyManager.registerKeyDown('Enter', handleEnter, { priority: 3 })));
	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	async function toggleForm(): Promise<void> {
		formOpen = !formOpen;
		todos.quickCreateOpen = formOpen;
		if (formOpen) {
			await tick();
			input?.focus();
			keyHandlers.Escape = keyManager.registerKeyDown('Escape', handleEscape);
		}
	}

	function onblur(): void {
		if (autocompleteOpen) return;
		formOpen = false;
		todos.quickCreateOpen = false;
		keyManager.unregisterKeyDown(keyHandlers.Escape);
	}

	async function onSubmit(): Promise<void> {
		if (autocompleteOpen) return;
		if (!formOpen) {
			await toggleForm();
			return;
		}

		loadingIndicator.start();
		try {
			const keepFormOpen = await createFromInput();
			if (!keepFormOpen) await toggleForm();
		} finally {
			loadingIndicator.stop();
		}
	}

	async function createFromInput(): Promise<boolean> {
		if (userInput.trim() === '') return false;

		const res = await todos.quickCreate(userInput);
		if (!res.ok) return false;
		if (res.recurrenceIgnored) {
			notifications.warning(ts.get.todos.recurrence_requires_due);
			return true;
		}

		userInput = '';
		notifications.success(ts.get.todos.create_success);
		return false;
	}

	function openSettings(): void {
		todos.openSettingsModal();
	}

	function handleEscape(event: KeyboardEvent): void {
		onblur();
	}

	async function handleEnter(event: KeyboardEvent): Promise<void> {
		await onSubmit();
	}
</script>

<div class="relative mb-4 flex h-14 w-full flex-row justify-end p-2 pr-0">
	{#if formOpen}
		{#if viewPoint.isDesktop}
			<InlineAutocomplete
				bind:input
				bind:value={userInput}
				{onblur}
				placeholder={ts.get.todos.enter_todo}
				triggers={autocompleteTriggers}
				bind:open={autocompleteOpen}
			/>
			<div class="absolute top-[-24px] right-8 flex items-center gap-8 text-xs max-md:hidden" in:fade>
				{#each syntaxHints as hint (hint.prefix)}
					<div class="flex items-center gap-1">
						<div class="bg-c-neutral-1 px-2 py-1 dark:bg-s-dark-2">{hint.prefix}</div>
						<span>{hint.label}</span>
					</div>
				{/each}
			</div>
		{:else}
			<BottomSheetModal title={ts.get.todos.new_todo} onClose={onblur}>
				<InlineAutocomplete
					bind:input
					bind:value={userInput}
					placeholder={ts.get.todos.enter_todo}
					triggers={autocompleteTriggers}
					bind:open={autocompleteOpen}
				/>
				<TextButton title={ts.get.layout.modal_confirm} type="action" onclick={onSubmit} class="mt-8 w-full" />
			</BottomSheetModal>
		{/if}
	{:else}
		<div class="flex items-center gap-2">
			<SettingsButton title={ts.get.nav.settings} onclick={openSettings} />
			<TextButton title={ts.get.todos.new_todo} onclick={toggleForm} />
		</div>
	{/if}
</div>
