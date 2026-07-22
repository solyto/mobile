<script lang="ts">
	import { tick } from 'svelte';
	import { fade } from 'svelte/transition';
	import { getKeyManager } from '$lib/KeyManager.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getTags } from '$lib/state/Tags.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import InlineAutocomplete from '$lib/components/forms/InlineAutocomplete.svelte';

	const keyManager = getKeyManager();
	const todos = getTodos();
	const tags = getTags();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();
	const ts = getTranslation();

	let formOpen = $state<boolean>(false);
	let userInput = $state<string>('');
	let input = $state<HTMLInputElement | null>(null);
	let autocompleteOpen = $state<boolean>(false);
	let keyHandlers = $state<{ [key: string]: string | null }>({ Enter: null, Escape: null });

	function getDueDateSuggestions(): { label: string; value: string }[] {
		const today = new Date();
		return Array.from({ length: 7 }, (_, i) => {
			const date = new Date(today);
			date.setDate(today.getDate() + i);
			const iso = date.toISOString().slice(0, 10);
			if (i === 0) return { label: ts.get.todos.due_today, value: iso };
			if (i === 1) return { label: ts.get.todos.due_tomorrow, value: iso };
			const weekdayKey = date.getDay() === 0 ? 7 : date.getDay();
			return { label: ts.get.calendar.weekdays[weekdayKey as keyof typeof ts.get.calendar.weekdays], value: iso };
		});
	}

	const recurrenceOptions = [
		{ label: ts.get.todos.recurrence_daily, value: 'daily' },
		{ label: ts.get.todos.recurrence_weekly, value: 'weekly' },
		{ label: ts.get.todos.recurrence_monthly, value: 'monthly' },
		{ label: ts.get.todos.recurrence_yearly, value: 'yearly' }
	];

	const autocompleteTriggers = $derived([
		{ prefix: '#', items: tags.tags.map((t) => ({ label: t.name })) },
		{ prefix: '/', items: todos.categories.map((c) => ({ label: c.title })) },
		{ prefix: 'due:', items: getDueDateSuggestions() },
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

	function handleEscape(event: KeyboardEvent): void {
		onblur();
	}

	async function handleEnter(event: KeyboardEvent): Promise<void> {
		if (autocompleteOpen) return;
		if (!formOpen) {
			await toggleForm();
			return;
		}

		loadingIndicator.start();

		if (userInput.trim() !== '') {
			const res = await todos.quickCreate(userInput);
			if (res.ok) {
				if (res.recurrenceIgnored) {
					notifications.warning(ts.get.todos.recurrence_requires_due);
					loadingIndicator.stop();
					return;
				}
				userInput = '';
				notifications.success(ts.get.todos.create_success);
			}
		}

		await toggleForm();
		loadingIndicator.stop();
	}
</script>

<div
	class="relative mb-4 flex h-14 w-full flex-row justify-end p-2 pl-20 sm:pl-30 lg:pl-2 2xl:pl-14 pr-0"
>
	{#if formOpen}
		<InlineAutocomplete
			bind:input
			bind:value={userInput}
			{onblur}
			placeholder="Enter todo"
			triggers={autocompleteTriggers}
			bind:open={autocompleteOpen}
		/>
		<div
			class="absolute top-[-24px] right-8 flex items-center gap-8 text-xs max-md:hidden"
			in:fade
		>
			<div class="flex items-center gap-1">
				<div class="bg-c-neutral-1 px-2 py-1 dark:bg-s-dark-2">/</div>
				<span>Category</span>
			</div>
			<div class="flex items-center gap-1">
				<div class="bg-c-neutral-1 px-2 py-1 dark:bg-s-dark-2">#</div>
				<span>Tag</span>
			</div>
			<div class="flex items-center gap-1">
				<div class="bg-c-neutral-1 px-2 py-1 dark:bg-s-dark-2">due:</div>
				<span>Due Date</span>
			</div>
			<div class="flex items-center gap-1">
				<div class="bg-c-neutral-1 px-2 py-1 dark:bg-s-dark-2">repeat:</div>
				<span>Recurrence</span>
			</div>
			<div class="flex items-center gap-1">
				<div class="bg-c-neutral-1 px-2 py-1 dark:bg-s-dark-2">link:</div>
				<span>Link</span>
			</div>
		</div>
	{:else}
		<TextButton title={ts.get.todos.new_todo} onclick={toggleForm} />
	{/if}
</div>
