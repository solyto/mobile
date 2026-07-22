<script lang="ts">
	import type { Todo, TodoRecurrenceFrequency } from '$lib/types/todo';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import IconRepeat from '@lucide/svelte/icons/repeat';
	import IconX from '@lucide/svelte/icons/x';
	import { formatDate } from '$lib/helpers/DateHelper';

	let { todo } = $props<{ todo: Todo }>();

	const todos = getTodos();
	const loadingIndicator = getLoadingIndicator();
	const ts = getTranslation();

	let isOpen = $state<boolean>(false);
	let selectedFrequency = $state<TodoRecurrenceFrequency | null>(todo.recurrence_frequency);
	let selectedInterval = $state<number>(todo.recurrence_interval ?? 1);
	let selectedEndsAt = $state<string>(todo.recurrence_ends_at ?? '');

	const hasDueDate = $derived(todo.due_at !== null);

	const frequencyOptions: { value: TodoRecurrenceFrequency; label: string }[] = [
		{ value: 'daily', label: ts.get.todos.recurrence_daily },
		{ value: 'weekly', label: ts.get.todos.recurrence_weekly },
		{ value: 'monthly', label: ts.get.todos.recurrence_monthly },
		{ value: 'yearly', label: ts.get.todos.recurrence_yearly }
	];

	function recurrenceLabel(): string {
		if (!todo.recurrence_frequency) return ts.get.todos.add_recurrence;
		const option = frequencyOptions.find((o) => o.value === todo.recurrence_frequency);
		return option?.label ?? todo.recurrence_frequency;
	}

	async function save(): Promise<void> {
		isOpen = false;
		loadingIndicator.start();
		await todos.changeRecurrence(
			todo,
			selectedFrequency,
			selectedInterval,
			selectedEndsAt || null
		);
		loadingIndicator.stop();
	}

	async function remove(): Promise<void> {
		selectedFrequency = null;
		selectedInterval = 1;
		selectedEndsAt = '';
		loadingIndicator.start();
		await todos.changeRecurrence(todo, null);
		loadingIndicator.stop();
	}

	function open(): void {
		if (!hasDueDate) return;
		selectedFrequency = todo.recurrence_frequency;
		selectedInterval = todo.recurrence_interval ?? 1;
		selectedEndsAt = todo.recurrence_ends_at ?? '';
		isOpen = true;
	}
</script>

<div class="group relative flex items-center gap-1">
	{#if !hasDueDate}
		<span class="cursor-not-allowed text-xs text-c-neutral-3 dark:text-c-neutral-6" title={ts.get.todos.recurrence_requires_due}>
			<IconRepeat class="size-4" />
		</span>
	{:else if todo.recurrence_frequency}
		<button
			class="flex cursor-pointer items-center gap-1 text-xs text-c-primary hover:text-c-primary/80"
			onclick={open}
		>
			<IconRepeat class="size-4" />
			<span>{recurrenceLabel()}</span>
		</button>
		<button
			class="hidden size-4 cursor-pointer items-center justify-center rounded-full bg-c-danger text-white group-hover:flex"
			onclick={remove}
		>
			<IconX class="size-3" />
		</button>
	{:else}
		<button
			class="cursor-pointer text-xs text-c-neutral-4 transition-all hover:text-c-neutral-7 dark:hover:text-white"
			onclick={open}
		>
			+ {ts.get.todos.add_recurrence}
		</button>
	{/if}
</div>

{#if isOpen}
	<div
		class="absolute z-50 mt-1 flex flex-col gap-3 rounded-lg border border-c-neutral-2 bg-white p-4 shadow-lg dark:border-s-dark dark:bg-s-dark-2"
		role="dialog"
	>
		<div class="flex flex-wrap gap-2">
			{#each frequencyOptions as option}
				<button
					class="rounded-md border px-3 py-1 text-xs transition-all"
					class:border-c-primary={selectedFrequency === option.value}
					class:text-c-primary={selectedFrequency === option.value}
					class:border-c-neutral-2={selectedFrequency !== option.value}
					class:dark:border-s-dark={selectedFrequency !== option.value}
					onclick={() => (selectedFrequency = option.value)}
				>
					{option.label}
				</button>
			{/each}
		</div>

		<div class="flex items-center gap-2 text-xs">
			<span class="text-c-neutral-5 dark:text-c-neutral-4">Every</span>
			<input
				type="number"
				min="1"
				max="365"
				bind:value={selectedInterval}
				class="w-14 rounded border border-c-neutral-2 bg-transparent px-2 py-1 text-center dark:border-s-dark"
			/>
			<span class="text-c-neutral-5 dark:text-c-neutral-4">
				{frequencyOptions.find((o) => o.value === selectedFrequency)?.label?.toLowerCase() ?? 'occurrence(s)'}
			</span>
		</div>

		<div class="flex flex-col gap-1 text-xs">
			<label for="recurrence-ends-at" class="text-c-neutral-5 dark:text-c-neutral-4">{ts.get.todos.recurrence_ends_at}</label>
			<input
				id="recurrence-ends-at"
				type="date"
				bind:value={selectedEndsAt}
				class="rounded border border-c-neutral-2 bg-transparent px-2 py-1 dark:border-s-dark"
			/>
		</div>

		<div class="flex justify-end gap-2">
			<button
				class="rounded px-3 py-1 text-xs text-c-neutral-5 hover:text-c-neutral-7 dark:hover:text-white"
				onclick={() => (isOpen = false)}
			>
				Cancel
			</button>
			<button
				class="rounded bg-c-primary px-3 py-1 text-xs text-white hover:bg-c-primary/80"
				onclick={save}
			>
				Save
			</button>
		</div>
	</div>
{/if}
