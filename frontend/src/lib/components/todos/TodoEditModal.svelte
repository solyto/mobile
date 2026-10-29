<script lang="ts">
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';
	import ModalFormRow from '$lib/components/ui/ModalFormRow.svelte';
	import Title from '$lib/components/todos/props/Title.svelte';
	import Status from '$lib/components/todos/props/Status.svelte';
	import Priority from '$lib/components/todos/props/Priority.svelte';
	import Category from '$lib/components/todos/props/Category.svelte';
	import Tags from '$lib/components/todos/props/Tags.svelte';
	import Effort from '$lib/components/todos/props/Effort.svelte';
	import DueDate from '$lib/components/todos/props/DueDate.svelte';
	import Progress from '$lib/components/todos/props/Progress.svelte';
	import Description from '$lib/components/todos/props/Description.svelte';
	import Link from '$lib/components/todos/props/Link.svelte';
	import Subtasks from '$lib/components/todos/props/Subtasks.svelte';
	import Recurrence from '$lib/components/todos/props/Recurrence.svelte';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import confetti from 'canvas-confetti';
	import { createConfettiOptions } from '$lib/effects/confetti';

	const todos = getTodos();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();

	let deleteConfirmOpen = $state<boolean>(false);

	async function onDeleteConfirm(): Promise<void> {
		if (!todos.editingTodo) return;

		loadingIndicator.start();
		await todos.delete(todos.editingTodo);
		notifications.success(ts.get.todos.delete_success);
		loadingIndicator.stop();
		deleteConfirmOpen = false;
		todos.closeEdit();
	}

	async function onComplete(event?: MouseEvent): Promise<void> {
		if (!todos.editingTodo) return;

		const target = event?.currentTarget as HTMLElement | undefined;
		const rect = target?.getBoundingClientRect();
		const x = rect ? (rect.left + rect.right) / 2 / window.innerWidth : 0.5;
		const y = rect ? (rect.top + rect.bottom) / 2 / window.innerHeight : 0.5;

		confetti(createConfettiOptions({ x, y }, 'default'));

		loadingIndicator.start();
		await todos.changeCompleted(todos.editingTodo, true);
		todos.editingTodo.is_completed = true;
		loadingIndicator.stop();
		todos.closeEdit();
	}
</script>

{#if todos.editingTodo}
	{@const todo = todos.editingTodo}
	<ContentModal
		onClose={() => todos.closeEdit()}
		{onComplete}
		onDelete={() => (deleteConfirmOpen = true)}
		rounded="2xl"
	>
		<div class="flex w-full flex-col gap-4">
			<div class="w-full">
				<Title {todo} />
			</div>
			<ModalFormRow label={ts.get.todos.status}>
				<Status {todo} changeStatus={true} portal />
			</ModalFormRow>
			<ModalFormRow label={ts.get.todos.priority}>
				<Priority {todo} changePriority={true} left portal expanded={false} compact />
			</ModalFormRow>
			<ModalFormRow label={ts.get.todos.category}>
				<Category {todo} />
			</ModalFormRow>
			<ModalFormRow label={ts.get.todos.tags}>
				<Tags {todo} />
			</ModalFormRow>
			<ModalFormRow label={ts.get.todos.effort}>
				<Effort {todo} changeEffort={true} left portal compact />
			</ModalFormRow>
			<ModalFormRow label={ts.get.todos.due_at}>
				<DueDate {todo} portal />
			</ModalFormRow>
			<ModalFormRow label={ts.get.todos.progress}>
				<Progress {todo} />
			</ModalFormRow>
			<ModalFormRow label={ts.get.todos.link}>
				<div class="-mt-2">
					<Link {todo} />
				</div>
			</ModalFormRow>
			<ModalFormRow label={ts.get.todos.recurrence}>
				<Recurrence {todo} portal />
			</ModalFormRow>
			<div class="w-full">
				<Subtasks {todo} subtasks={todo.subtasks} fullWidth />
			</div>
			<div class="w-full">
				<Description {todo} />
			</div>
		</div>
	</ContentModal>
	{#if deleteConfirmOpen}
		<ConfirmationModal
			title={ts.get.todos.delete_confirm_label}
			description={ts.get.todos.delete_confirm_message}
			type="confirm-delete"
			onConfirm={onDeleteConfirm}
			onCancel={() => (deleteConfirmOpen = false)}
		/>
	{/if}
{/if}
