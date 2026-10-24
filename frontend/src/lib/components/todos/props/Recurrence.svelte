<script lang="ts">
	import type { Todo, TodoRecurrenceFrequency } from '$lib/types/todo';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { portalToBody } from '$lib/helpers/PortalHelper';
	import { clickOutside } from '$lib/helpers/ClickHelper';
	import { getViewPoint } from '$lib/state/Viewpoint.svelte';
	import { scale } from 'svelte/transition';
	import IconRepeat from '@lucide/svelte/icons/repeat';
	import NumberInput from '$lib/components/forms/NumberInput.svelte';
	import DateInput from '$lib/components/forms/DateInput.svelte';
	import SegmentedControl from '$lib/components/forms/SegmentedControl.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';

	let { todo, portal = false }: {
		todo: Todo;
		portal?: boolean;
	} = $props();

	const todos = getTodos();
	const loadingIndicator = getLoadingIndicator();
	const ts = getTranslation();
	const viewPoint = getViewPoint();

	let isOpen = $state<boolean>(false);
	let selectedFrequency = $state<TodoRecurrenceFrequency | null>(todo.recurrence_frequency);
	let selectedInterval = $state<number>(todo.recurrence_interval ?? 1);
	let selectedEndsAt = $state<string>(todo.recurrence_ends_at ?? '');
	let trigger = $state<HTMLDivElement | null>(null);

	const hasDueDate = $derived(todo.due_at !== null);

	const frequencyOptions: { value: TodoRecurrenceFrequency; label: string }[] = [
		{ value: 'daily', label: ts.get.todos.recurrence_daily },
		{ value: 'weekly', label: ts.get.todos.recurrence_weekly },
		{ value: 'monthly', label: ts.get.todos.recurrence_monthly },
		{ value: 'yearly', label: ts.get.todos.recurrence_yearly }
	];

	const intervalUnits: Record<TodoRecurrenceFrequency, string> = {
		daily: ts.get.todos.recurrence_unit_daily,
		weekly: ts.get.todos.recurrence_unit_weekly,
		monthly: ts.get.todos.recurrence_unit_monthly,
		yearly: ts.get.todos.recurrence_unit_yearly
	};

	function intervalUnit(): string {
		return selectedFrequency ? intervalUnits[selectedFrequency] : ts.get.todos.recurrence_unit_fallback;
	}

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
		close();
	}

	function open(): void {
		if (!hasDueDate) return;
		selectedFrequency = todo.recurrence_frequency;
		selectedInterval = todo.recurrence_interval ?? 1;
		selectedEndsAt = todo.recurrence_ends_at ?? '';
		isOpen = true;
	}

	function close(): void {
		isOpen = false;
	}
</script>

<div bind:this={trigger} class="relative flex items-center gap-1">
	{#if !hasDueDate}
		<span class="flex cursor-not-allowed items-center gap-1 text-xs text-c-neutral-3 dark:text-c-neutral-6" title={ts.get.todos.recurrence_requires_due}>
			<IconRepeat class="size-4" />
			{#if viewPoint.isMobile}
				<span>{ts.get.todos.recurrence_requires_due}</span>
			{/if}
		</span>
	{:else if todo.recurrence_frequency}
		<button
			class="flex cursor-pointer items-center gap-1 text-xs text-c-primary hover:text-c-primary/80"
			onclick={open}
		>
			<IconRepeat class="size-4" />
			<span>{recurrenceLabel()}</span>
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

{#snippet popover()}
	<div
		class="flex flex-col gap-3 rounded-lg border border-c-neutral-2 bg-c-bg-modal p-4 shadow-lg dark:border-s-dark"
		class:absolute={!portal}
		class:mt-1={!portal}
		class:mt-6={portal && !viewPoint.isMobile}
		class:z-50={!portal}
		role="dialog"
		use:clickOutside={close}
		in:scale|global={{ start: 0.9, duration: 150 }}
	>
		<SegmentedControl bind:value={selectedFrequency} options={frequencyOptions} />

		<div class="flex items-center gap-2 text-xs">
			<span class="text-c-neutral-5 dark:text-c-neutral-4">{ts.get.todos.recurrence_every}</span>
			<div class="w-16">
				<NumberInput bind:value={selectedInterval} min={1} max={365} />
			</div>
			<span class="text-c-neutral-5 dark:text-c-neutral-4">{intervalUnit()}</span>
		</div>

		<div class="flex flex-col gap-1 text-xs">
			<label for="recurrence-ends-at" class="text-c-neutral-5 dark:text-c-neutral-4">{ts.get.todos.recurrence_ends_at}</label>
			<DateInput id="recurrence-ends-at" bind:value={selectedEndsAt} />
		</div>

		<div class="flex items-center justify-between gap-2">
			{#if todo.recurrence_frequency}
				<TextButton title={ts.get.layout.remove} type="plain" class="text-c-danger" onclick={remove} />
			{/if}
			<TextButton title={ts.get.layout.modal_cancel} type="plain" onclick={close} />
			<TextButton title={ts.get.layout.save} type="primary" onclick={save} />
		</div>
	</div>
{/snippet}

{#if isOpen}
	{#if portal && viewPoint.isMobile}
		<div class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center pr-16 pl-4">
			<div class="pointer-events-auto">
				{@render popover()}
			</div>
		</div>
	{:else if portal}
		<div use:portalToBody={{ target: trigger, closeOnScroll: true, onClose: close }}>
			{@render popover()}
		</div>
	{:else}
		{@render popover()}
	{/if}
{/if}
