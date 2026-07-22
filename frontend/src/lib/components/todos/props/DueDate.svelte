<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import { formatDate } from '$lib/helpers/DateHelper';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import IconCalendarClock from '@lucide/svelte/icons/calendar-clock';
	import DatePicker from '$lib/components/forms/DatePicker.svelte';
	import InlineDeleteButton from '$lib/components/ui/buttons/InlineDeleteButton.svelte';
	import DeleteButton from '$lib/components/ui/buttons/DeleteButton.svelte';
	import IconTrash from '@lucide/svelte/icons/trash-2';
	import { getAuth } from '$lib/state/Auth.svelte';

	let { todo, reversed = false } = $props<{
		todo: Todo;
		reversed?: boolean;
	}>();

	const todos = getTodos();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const auth = getAuth();

	let isOpen = $state<boolean>(false);
	let startDate = $state<Date | null>(new Date(todo.due_at));

	function toggleDatePicker(): void {
		isOpen = !isOpen;
	}

	async function onChange(): Promise<void> {
		loadingIndicator.start();
		await todos.changeDue(todo, startDate !== null ? formatDate(startDate) : null);
		loadingIndicator.stop();
	}
</script>

{#if todo.due_at !== null}
	<div class="group relative">
		<button
			class="flex cursor-pointer {reversed
				? 'flex-row-reverse'
				: 'flex-row'} items-center justify-end gap-2"
			class:pr-4={todos.view === 'list'}
			class:ml-1={todos.view === 'kanban'}
			onclick={toggleDatePicker}
		>
			<span>{auth.getDateInUserPreferredFormat(todo.due_at)}</span>
			<IconCalendarClock class="size-4 shrink-0" />
		</button>
		<button
			class="absolute top-[-14px] right-[-14px] z-40 hidden size-[20px] cursor-pointer items-center justify-center rounded-full bg-c-danger text-white drop-shadow-md transition-all group-hover:flex hover:text-c-heading hover:drop-shadow-xl"
			onclick={async () => {
				startDate = null;
				await onChange();
			}}
		>
			<IconTrash class="size-3" />
		</button>
	</div>
{:else}
	<div class={todos.view === 'list' ? 'w-full pr-4 text-right' : ''}>
		<button
			class="cursor-pointer text-xs text-c-neutral-4 transition-all hover:text-c-neutral-7 dark:hover:text-white"
			class:opacity-0={todos.view === 'list'}
			class:group-hover:opacity-100={todos.view === 'list'}
			onclick={toggleDatePicker}>+ {ts.get.todos.add_due_at}</button
		>
	</div>
{/if}
<DatePicker bind:isOpen bind:startDate {onChange} />
