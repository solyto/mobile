<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import { fade, slide } from 'svelte/transition';
	import Category from '$lib/components/todos/props/Category.svelte';
	import DueDate from '$lib/components/todos/props/DueDate.svelte';
	import Tags from '$lib/components/todos/props/Tags.svelte';
	import Priority from '$lib/components/todos/props/Priority.svelte';
	import Progress from '$lib/components/todos/props/Progress.svelte';
	import Effort from '$lib/components/todos/props/Effort.svelte';
	import Status from '$lib/components/todos/props/Status.svelte';
	import Title from '$lib/components/todos/props/Title.svelte';
	import ScoreBar from '$lib/components/todos/ScoreBar.svelte';
	import Description from '$lib/components/todos/props/Description.svelte';
	import Checkbox from '$lib/components/forms/Checkbox.svelte';
	import { getTodos } from '$lib/state/Todos.svelte';
	import Subtasks from '$lib/components/todos/props/Subtasks.svelte';
	import TodoDelete from '$lib/components/todos/actions/TodoDelete.svelte';
	import IconChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import Flags from '$lib/components/todos/props/Flags.svelte';
	import Recurrence from '$lib/components/todos/props/Recurrence.svelte';

	let { todo, handleCheck } = $props<{
		todo: Todo;
		handleCheck: (event: Event, todo: Todo) => Promise<void>;
	}>();

	const todos = getTodos();

	let expanded = $state<boolean>(false);

	function getBgColor(todo: Todo): string {
		switch (todo.priority) {
			case 'low':
				return 'bg-c-success';
			case 'high':
				return 'bg-c-danger';
			default:
				return 'bg-c-btn';
		}
	}
</script>

<div
	class="relative flex w-full flex-col space-y-2 rounded-lg border-1 bg-c-bg-surface p-4 shadow-sm transition-all hover:bg-d-lighterblue dark:hover:bg-s-dark-3 {todos.recentlyCreated === todo.id ? 'border-c-btn-hover' : 'border-d-lightblue dark:border-s-dark'}"
	in:fade
>
	<div class="absolute top-0 left-0 h-full w-1 rounded-l-md {getBgColor(todo)}"></div>
	<ScoreBar {todo} />
	<div class="relative w-full">
		<span class="font-bold">
			<Title {todo} />
		</span>
		<div class="absolute top-1 right-1 flex flex-row items-center gap-2">
			<Checkbox isChecked={todo.is_completed} onchange={(e: Event) => handleCheck(e, todo)} />
		</div>
	</div>
	<div class="flex w-full flex-row items-center gap-2">
		<Status {todo} changeStatus={true} />
		<Category {todo} />
		<Tags {todo} />
	</div>
	<div class="relative flex w-full flex-row items-center gap-2">
		<Priority {todo} changePriority={true} expanded={false} />
		<Effort {todo} changeEffort={true} />
		<DueDate {todo} reversed={true} />
	</div>
	<div class="flex w-full flex-row items-center justify-between">
		<div class="w-6/10">
			<Progress {todo} />
		</div>
		<div class="flex flex-row items-center gap-2">
			<TodoDelete {todo} />
			<IconChevronsUpDown
				class="cursor-pointer text-c-action"
				onclick={() => (expanded = !expanded)}
			/>
		</div>
	</div>
	<Flags {todo} />
	{#if expanded}
		<div class="relative w-full" transition:slide>
			<Description {todo} />
			<Subtasks {todo} subtasks={todo.subtasks} />
			<div class="relative mt-3">
				<Recurrence {todo} />
			</div>
		</div>
	{/if}
</div>
