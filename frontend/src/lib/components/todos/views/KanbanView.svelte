<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { getTodos } from '$lib/state/Todos.svelte';
	import CompactEntry from '$lib/components/todos/views/CompactEntry.svelte';
	import type { GroupedTodos, Todo, TodoStatus } from '$lib/types/todo';
	import { dndzone, type DndEvent } from 'svelte-dnd-action';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';

	const todos = getTodos();
	const loadingIndicator = getLoadingIndicator();
	const flipDurationMs = 200;

	let { handleCheck }: { handleCheck: (event: Event, todo: Todo) => Promise<void> } = $props();
	let groups = $derived<GroupedTodos[]>(todos.groupedTodos);
	let firstTick = $state<boolean>(true);

	onMount(() => {
		todos.groupByStatus();
	});

	function getStatusLabel(status: TodoStatus): string {
		switch (status) {
			case 'backlog':
				return 'Backlog';
			case 'in-progress':
				return 'In Progress';
			case 'waiting':
				return 'Waiting';
			case 'almost-done':
				return 'Almost done';
			default:
				return 'Pending';
		}
	}

	function getStatusColor(status: TodoStatus): string {
		switch (status) {
			case 'pending':
			default:
				return 'gray-200';
			case 'in-progress':
				return 'c-action';
			case 'waiting':
				return 'c-primary';
			case 'almost-done':
				return 'c-success';
		}
	}

	function handleDndConsiderCards(cid: number, e: CustomEvent<DndEvent<Todo>>) {
		const colIdx = groups.findIndex((c) => c.id === cid);
		groups[colIdx].todos = e.detail.items;
		groups = [...groups];
	}

	async function handleDndFinalizeCards(cid: number, e: CustomEvent<DndEvent<Todo>>) {
		const colIdx = groups.findIndex((c) => c.id === cid);
		groups[colIdx].todos = e.detail.items;
		groups = [...groups];

		const shouldProcess = firstTick;
		firstTick = !firstTick;

		if (shouldProcess) {
			const status = (e.target as HTMLElement | null)?.dataset.status as TodoStatus;
			await handleStatusChange(e.detail.info.id, status);
		}
	}

	async function handleStatusChange(todoId: string, status: TodoStatus): Promise<void> {
		loadingIndicator.start();
		await todos.changeStatus(todoId, status);
		await todos.load();

		loadingIndicator.stop();
	}
</script>

<div class="flex w-full flex-row justify-between">
	{#each todos.groupedTodos as group (group.status)}
		<div
			class="flex w-[24%] flex-col rounded-lg transition-all duration-400"
			animate:flip={{ duration: flipDurationMs }}
		>
			<div class="mb-6 border-b-4 p-4 border-{getStatusColor(group.status)}">
				<Heading title={getStatusLabel(group.status)} my={0} />
			</div>
			<div
				class="flex flex-1 flex-col space-y-4 rounded-lg !outline-0 transition-all"
				data-status={group.status}
				use:dndzone={{
					items: group.todos,
					flipDurationMs,
					dropTargetClasses: ['shadow-lg', 'ring-2', 'ring-d-lightblue']
				}}
				onconsider={(e) => handleDndConsiderCards(group.id, e)}
				onfinalize={(e) => handleDndFinalizeCards(group.id, e)}
			>
				{#each group.todos as item (item.id)}
					<div animate:flip={{ duration: flipDurationMs }} transition:fade>
						<CompactEntry todo={item} {handleCheck} minimal={false} showStatus={false} />
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>
