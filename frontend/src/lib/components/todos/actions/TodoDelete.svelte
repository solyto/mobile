<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import DeleteButton from '$lib/components/ui/buttons/DeleteButton.svelte';

	const todos = getTodos();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();

	let { todo } = $props<{ todo: Todo }>();

	let modalOpen = $state<boolean>(false);

	function openModal(): void {
		modalOpen = true;
	}

	async function onConfirm(): Promise<void> {
		loadingIndicator.start();
		await todos.delete(todo);
		notifications.success(ts.get.todos.delete_success);
		loadingIndicator.stop();
	}

	function onCancel(): void {
		modalOpen = false;
	}
</script>

<div class="z-10">
	<DeleteButton onClick={openModal} inModal={false} buttonStyle="plain" />
</div>

{#if modalOpen}
	<Modal
		title={ts.get.todos.delete_confirm_label}
		description={ts.get.todos.delete_confirm_message}
		type="confirm-delete"
		{onConfirm}
		{onCancel}
	/>
{/if}
