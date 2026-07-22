<script lang="ts">
	import { onDestroy, tick } from 'svelte';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getKeyManager } from '$lib/KeyManager.svelte';
	import InputAutocomplete from '$lib/components/forms/InputAutocomplete.svelte';
	import QuickSelectOverlay from '$lib/components/ui/QuickSelectOverlay.svelte';
	import TodoEntry from '$lib/components/calendars/TodoEntry.svelte';
	import IconPlus from '@lucide/svelte/icons/plus';
	import IconX from '@lucide/svelte/icons/x';
	import IconNotebook from '@lucide/svelte/icons/notebook';
	import { urls } from '$lib/config/urls';
	import type { Todo } from '$lib/types/todo';
	import type { Note } from '$lib/types/note';


	const calendars = getCalendars();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const keyManager = getKeyManager();

	let keyHandlers = $state<{ Escape: string | null }>({ Escape: null });
	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	let { eventId } = $props<{ eventId: number }>();

	let menuOpen = $state(false);
	let addingTodo = $state(false);
	let addingNote = $state(false);
	let todoInputRef = $state<HTMLInputElement | null>(null);
	let noteInputRef = $state<HTMLInputElement | null>(null);
	let todoInputValue = $state('');
	let noteInputValue = $state('');
	let todoAutocompleteOpen = $state(false);
	let noteAutocompleteOpen = $state(false);

	const attachedTodoIds = $derived(new Set(calendars.activeEventTodos.map((t) => t.id)));
	const attachedNoteIds = $derived(new Set(calendars.activeEventNotes.map((n) => n.id)));

	const availableTodos = $derived(
		calendars.todos.filter((t) => !t.is_completed && !attachedTodoIds.has(t.id))
	);
	const availableNotes = $derived(
		calendars.availableNotes.filter((n) => !attachedNoteIds.has(n.id))
	);

	async function pickTodo(): Promise<void> {
		menuOpen = false;
		addingTodo = true;
		keyHandlers.Escape = keyManager.registerKeyDown('Escape', closeTodo);
		await tick();
		todoInputRef?.focus();
	}

	async function pickNote(): Promise<void> {
		menuOpen = false;
		loadingIndicator.start();
		await calendars.loadAvailableNotes();
		loadingIndicator.stop();
		addingNote = true;
		keyHandlers.Escape = keyManager.registerKeyDown('Escape', closeNote);
		await tick();
		noteInputRef?.focus();
	}

	function closeTodo(): void {
		addingTodo = false;
		todoInputValue = '';
		keyManager.unregisterKeyDown(keyHandlers.Escape);
		keyHandlers.Escape = null;
	}

	function closeNote(): void {
		addingNote = false;
		noteInputValue = '';
		keyManager.unregisterKeyDown(keyHandlers.Escape);
		keyHandlers.Escape = null;
	}

	async function selectTodo(label: string): Promise<void> {
		const todo = availableTodos.find((t) => t.title === label);
		if (!todo) return;
		loadingIndicator.start();
		await calendars.attachTodo(eventId, todo.id);
		loadingIndicator.stop();
		closeTodo();
	}

	async function selectNote(label: string): Promise<void> {
		const note = availableNotes.find((n) => n.title === label);
		if (!note) return;
		loadingIndicator.start();
		await calendars.attachNote(eventId, note.id);
		loadingIndicator.stop();
		closeNote();
	}

	async function detachTodo(todo: Todo): Promise<void> {
		loadingIndicator.start();
		await calendars.detachTodo(eventId, todo.id);
		loadingIndicator.stop();
	}

	async function detachNote(note: Note): Promise<void> {
		loadingIndicator.start();
		await calendars.detachNote(eventId, note.id);
		loadingIndicator.stop();
	}
</script>

<div class="w-full mt-2 pt-4">
	<div class="relative mb-3 flex items-center justify-between">
		<p class="text-xs font-semibold uppercase tracking-wide text-c-neutral-5 dark:text-c-neutral-4 pl-1">
			{ts.get.calendar.attachments}
		</p>
		<button
			type="button"
			class="shrink-0 cursor-pointer text-c-neutral-4 mr-1 transition-colors hover:text-c-neutral-6 dark:hover:text-white"
			onclick={() => (menuOpen = !menuOpen)}
		>
			<IconPlus size={18} />
		</button>
		{#if menuOpen}
			<QuickSelectOverlay
				onClose={() => (menuOpen = false)}
				class="right-0 top-full mt-1 gap-0"
				p={0}
			>
				<button
					type="button"
					class="w-full cursor-pointer rounded px-4 py-2 text-left text-sm hover:bg-c-neutral-1 dark:text-white dark:hover:bg-s-dark-3"
					onclick={pickTodo}
				>
					{ts.get.calendar.attachment_todo}
				</button>
				<button
					type="button"
					class="w-full cursor-pointer text-left rounded px-4 py-2 text-left text-sm hover:bg-c-neutral-1 dark:text-white dark:hover:bg-s-dark-3"
					onclick={pickNote}
				>
					{ts.get.calendar.attachment_note}
				</button>
			</QuickSelectOverlay>
		{/if}
	</div>

	<div class="w-full flex flex-col gap-1">
		<div class="w-full flex flex-col gap-0 px-0.5">
			{#each calendars.activeEventTodos as todo (todo.id)}
				<div class="flex items-center gap-1">
					<div class="min-w-0 flex-1">
						<TodoEntry {todo} checkboxRight={false} showPriority={false} px={false} />
					</div>
					<button
						type="button"
						class="shrink-0 cursor-pointer text-c-neutral-4 mr-1 transition-colors hover:text-c-danger dark:hover:text-c-danger"
						onclick={() => detachTodo(todo)}
					>
						<IconX size={14} />
					</button>
				</div>
			{/each}
		</div>

		<div class="w-full flex flex-col gap-0 px-0.5">
			{#each calendars.activeEventNotes as note (note.id)}
				<div class="flex items-center justify-between gap-2 py-1">
					<a
						href={urls.note.replace('[id]', note.id)}
						target="_blank"
						rel="noopener noreferrer"
						class="flex min-w-0 items-center gap-1.5 truncate hover:opacity-80"
					>
						<IconNotebook size={20} class="text-c-neutral-3" />
						<span class="truncate text-sm text-c-action underline">{note.title}</span>
					</a>
					<button
						type="button"
						class="shrink-0 cursor-pointer text-c-neutral-4 mr-1 transition-colors hover:text-c-danger dark:hover:text-c-danger"
						onclick={() => detachNote(note)}
					>
						<IconX size={14} />
					</button>
				</div>
			{/each}
		</div>
	</div>

	{#if addingTodo}
		<div class="mt-1">
			<InputAutocomplete
				bind:input={todoInputRef}
				bind:value={todoInputValue}
				bind:open={todoAutocompleteOpen}
				placeholder={ts.get.calendar.search_todo}
				items={availableTodos.map((t) => ({ label: t.title }))}
				onblur={closeTodo}
				onselect={selectTodo}
			/>
		</div>
	{/if}

	{#if addingNote}
		<div class="mt-1">
			<InputAutocomplete
				bind:input={noteInputRef}
				bind:value={noteInputValue}
				bind:open={noteAutocompleteOpen}
				placeholder={ts.get.calendar.search_note}
				items={availableNotes.map((n) => ({ label: n.title }))}
				onblur={closeNote}
				onselect={selectNote}
			/>
		</div>
	{/if}
</div>

