<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import type { Todo } from '$lib/types/todo';
	import IconChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import Category from '$lib/components/todos/props/Category.svelte';
	import Priority from '$lib/components/todos/props/Priority.svelte';
	import Tags from '$lib/components/todos/props/Tags.svelte';
	import Status from '$lib/components/todos/props/Status.svelte';
	import Effort from '$lib/components/todos/props/Effort.svelte';
	import Progress from '$lib/components/todos/props/Progress.svelte';
	import DueDate from '$lib/components/todos/props/DueDate.svelte';
	import Title from '$lib/components/todos/props/Title.svelte';
	import Description from '$lib/components/todos/props/Description.svelte';
	import Link from '$lib/components/todos/props/Link.svelte';
	import TodoDelete from '$lib/components/todos/actions/TodoDelete.svelte';
	import Checkbox from '$lib/components/forms/Checkbox.svelte';
	import ScoreBar from '$lib/components/todos/ScoreBar.svelte';
	import Subtasks from '$lib/components/todos/props/Subtasks.svelte';
	import Flags from '$lib/components/todos/props/Flags.svelte';
	import Recurrence from '$lib/components/todos/props/Recurrence.svelte';
	import { getTodos } from '$lib/state/Todos.svelte';

	let { todo, handleCheck } = $props<{
		todo: Todo;
		handleCheck: (event: Event, todo: Todo) => Promise<void>;
	}>();

	const todos = getTodos();

	let expanded = $state<boolean>(false);
</script>

<div
	class="group relative flex h-auto w-full flex-row flex-wrap items-center rounded-lg border-1 shadow-sm transition-all hover:bg-d-lighterblue dark:hover:bg-s-dark-3 {todos.recentlyCreated === todo.id ? 'border-c-btn-hover' : 'border-d-lightblue dark:border-s-dark'}"
	class:bg-c-bg-surface={!todo.is_completed}
	class:bg-c-neutral-1={todo.is_completed}
	class:dark:bg-c-bg={todo.is_completed}
	in:fade
>
	<ScoreBar {todo} />
	<div class="h-full w-14">
		<Priority {todo} changePriority={true} {expanded} />
	</div>
	<div class="ml-4 w-[25%] font-bold">
		<Title {todo} />
	</div>
	<div class="group flex w-1/10 items-center">
		<Status {todo} changeStatus={true} />
	</div>
	<div class="group flex w-1/10 items-center">
		<Category {todo} />
	</div>
	<div class="group flex w-1/5 items-center">
		<Tags {todo} />
	</div>
	<div class="h-full w-14">
		<Effort {todo} changeEffort={true} />
	</div>
	<div class="group flex w-1/16 items-center">
		<Progress {todo} />
	</div>
	<div class="group ml-auto w-1/16 justify-end">
		<DueDate {todo} />
	</div>
	<div class="ml-auto flex h-full w-auto flex-row items-center gap-2 pr-2 2xl:gap-4 2xl:pr-4">
		<TodoDelete {todo} />
		<IconChevronsUpDown
			class="cursor-pointer text-c-action"
			onclick={() => (expanded = !expanded)}
		/>
		<Checkbox isChecked={todo.is_completed} onchange={(e: Event) => handleCheck(e, todo)} />
	</div>
	<Flags {todo} />
	{#if expanded}
		<div class="w-full p-4" transition:slide>
			<Description {todo} />
			<Link {todo} />
			<Subtasks {todo} subtasks={todo.subtasks} />
			<div class="relative mt-3">
				<Recurrence {todo} />
			</div>
		</div>
	{/if}
</div>
