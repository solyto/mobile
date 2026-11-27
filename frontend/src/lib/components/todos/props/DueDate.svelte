<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import { formatDate } from '$lib/helpers/DateHelper';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import IconTrash from '$lib/icons/lucide/trash.svelte';
	import IconCalendarClock from '$lib/icons/lucide/calendar-clock.svelte';
	import DatePicker from '$lib/components/forms/DatePicker.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { portalToBody } from '$lib/helpers/PortalHelper';
	import { getViewPoint } from '$lib/state/Viewpoint.svelte';

	let { todo, portal = false, withIcon = false, readonly = false }: {
		todo: Todo;
		portal?: boolean;
		withIcon?: boolean;
		readonly?: boolean;
	} = $props();

	const todos = getTodos();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const auth = getAuth();
	const viewPoint = getViewPoint();

	let isOpen = $state<boolean>(false);
	let startDate = $state<Date | null>(new Date(todo.due_at));
	let dateTrigger = $state<HTMLButtonElement | null>(null);

	function toggleDatePicker(): void {
		isOpen = !isOpen;
	}

	async function onChange(): Promise<void> {
		loadingIndicator.start();
		try {
			await todos.changeDue(todo, startDate !== null ? formatDate(startDate) : null);
		} finally {
			loadingIndicator.stop();
		}
	}

	async function removeDueDate(): Promise<void> {
		startDate = null;
		await onChange();
	}

	function closeDatePicker(): void {
		isOpen = false;
	}
</script>

{#if readonly}
	{#if todo.due_at !== null}
		<span class="text-sm">{auth.getDateInUserPreferredFormat(todo.due_at)}</span>
	{/if}
{:else if todo.due_at !== null}
	<div class="group relative">
		<button
			bind:this={dateTrigger}
			class="cursor-pointer"
			class:flex={withIcon}
			class:items-center={withIcon}
			class:gap-2={withIcon}
			class:text-sm={!withIcon}
			class:pr-4={todos.isRowView}
			class:ml-1={todos.view === 'kanban'}
			onclick={toggleDatePicker}
		>
			{#if withIcon}
				<span>{auth.getDateInUserPreferredFormat(todo.due_at)}</span>
				<IconCalendarClock class="size-4 shrink-0" />
			{:else}
				{auth.getDateInUserPreferredFormat(todo.due_at)}
			{/if}
		</button>
		<button
			class="absolute top-[-14px] right-[-14px] z-40 hidden size-[20px] cursor-pointer items-center justify-center rounded-full bg-c-danger text-white drop-shadow-md transition-all group-hover:flex hover:text-c-heading hover:drop-shadow-xl"
			onclick={removeDueDate}
		>
			<IconTrash class="size-3" />
		</button>
	</div>
{:else}
	<div class:w-full={todos.isRowView} class:pr-4={todos.isRowView}>
		<button
			bind:this={dateTrigger}
			class="cursor-pointer text-xs text-c-neutral-4 transition-all hover:text-c-neutral-7 dark:hover:text-white"
			class:opacity-0={todos.isRowView}
			class:group-hover:opacity-100={todos.isRowView}
			onclick={toggleDatePicker}>+ {ts.get.todos.add_due_at}</button
		>
	</div>
{/if}
{#snippet datePicker()}
	<DatePicker bind:isOpen bind:startDate weekStart={auth.getWeekStart()} {onChange} />
{/snippet}

{#if portal && viewPoint.isMobile}
	<div class="centered-datepicker">
		{@render datePicker()}
	</div>
{:else if portal}
	<div use:portalToBody={{ target: dateTrigger, closeOnScroll: true, onClose: closeDatePicker }}>
		{@render datePicker()}
	</div>
{:else}
	{@render datePicker()}
{/if}

<style>
	.centered-datepicker :global(.datepicker) {
		--datepicker-container-position: fixed;
		--datepicker-container-left: 1rem;
		--datepicker-container-top: 0;
	}

	.centered-datepicker :global(.calendars-container) {
		right: 4rem;
		bottom: 0;
		height: fit-content;
		margin: auto;
	}
</style>
