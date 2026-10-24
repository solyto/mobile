<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import { fade } from 'svelte/transition';
	import DueDate from '$lib/components/todos/props/DueDate.svelte';
	import Category from '$lib/components/todos/props/Category.svelte';
	import Status from '$lib/components/todos/props/Status.svelte';
	import Progress from '$lib/components/todos/props/Progress.svelte';
	import Tags from '$lib/components/todos/props/Tags.svelte';
	import Flags from '$lib/components/todos/props/Flags.svelte';
	import ScoreBar from '$lib/components/todos/ScoreBar.svelte';
	import Checkbox from '$lib/components/forms/Checkbox.svelte';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getPriorityColorClass } from '$lib/helpers/TodoHelper';

	const todos = getTodos();

	let {
		todo,
		handleCheck,
		minimal = true,
		showStatus = true
	}: {
		todo: Todo;
		handleCheck: (event: Event, todo: Todo) => Promise<void>;
		minimal?: boolean;
		showStatus?: boolean;
	} = $props();

	function openEdit(): void {
		todos.openEdit(todo.id);
	}

	function stopPropagation(event: Event): void {
		event.stopPropagation();
	}
</script>

<div
	class="relative w-full cursor-pointer rounded-lg border-1 bg-c-bg-surface px-4 py-2 shadow-sm transition-all {todos.recentlyCreated ===
	todo.id
		? 'border-c-btn-hover'
		: 'border-d-lightblue dark:border-s-dark'}"
	class:opacity-50={todo.is_completed}
	role="button"
	tabindex="0"
	onclick={openEdit}
	onkeydown={(e) => e.key === 'Enter' && openEdit()}
	in:fade
>
	<div class="todo-priority-bar absolute top-0 left-0 h-full w-1 rounded-l-md {getPriorityColorClass(todo.priority)}"></div>
	<ScoreBar {todo} />
	<div class="flex items-center gap-3">
		<span
			class="flex-1"
			class:truncate={minimal}
			class:line-clamp-2={!minimal}
			class:font-semibold={!minimal}
			class:line-through={todo.is_completed}
		>
			{todo.title}
		</span>
		<div class="flex shrink-0 items-center gap-2">
			<div class="mt-1" onclick={stopPropagation}>
				<Checkbox isChecked={todo.is_completed} onchange={(e: Event) => handleCheck(e, todo)} />
			</div>
		</div>
	</div>
	{#if !minimal}
		<div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
			{#if showStatus && todo.status !== 'pending'}
				<Status {todo} changeStatus={false} />
			{/if}
			{#if todo.due_at}
				<DueDate {todo} readonly />
			{/if}
			<Category {todo} readonly />
			<Tags {todo} readonly />
		</div>
		<Progress {todo} mobile />
	{/if}
	<Flags {todo} />
</div>
