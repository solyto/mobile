<script lang="ts">
	import { scale, fade, blur } from 'svelte/transition';
	import { getKeyManager } from '$lib/KeyManager.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { onDestroy, onMount } from 'svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';

	const ts = getTranslation(),
		keyManager = getKeyManager();

	let { action, onThisOccurrence, onAllOccurrences, onCancel } = $props<{
		action: 'edit' | 'delete';
		onThisOccurrence: () => void | Promise<any>;
		onAllOccurrences: () => void | Promise<any>;
		onCancel: () => any;
	}>();

	let visible = $state<boolean>(false);
	let keyHandlers = $state<{ [key: string]: string | null }>({ Escape: null });

	onMount(() => {
		setTimeout(() => {
			visible = true;
		}, 0);
	});

	onMount(() => {
		keyHandlers.Escape = keyManager.registerKeyDown('Escape', handleEscape);
	});

	function handleEscape(event: KeyboardEvent): void {
		onCancel();
		keyManager.unregisterAll(keyHandlers);
	}

	onDestroy(() => keyManager.unregisterAll(keyHandlers));
</script>

{#if visible}
	<div
		class="fixed top-0 left-0 z-70 flex h-screen w-screen justify-center bg-transparent backdrop-blur-xs transition-all"
		out:fade
		in:blur={{ duration: 300 }}
	>
		<div
			class="relative my-auto flex justify-center p-8 max-md:w-[95%] max-md:p-0"
			in:scale={{ start: 0.75 }}
		>
			<div
				class="absolute top-[-20px] left-12 z-40 w-full text-2xl font-bold tracking-wide text-c-heading max-md:hidden dark:text-c-primary"
			>
				{ts.get.calendar.recurring_event}
			</div>
			<div
				class="w-96 rounded-2xl border-1 border-c-neutral-2 bg-white p-4 shadow-md dark:border-s-dark dark:bg-s-dark-2"
			>
				<div class="mb-6 w-full text-sm text-c-neutral-5">
					{action === 'edit'
						? ts.get.calendar.recurring_edit_question
						: ts.get.calendar.recurring_delete_question}
				</div>
				<div class="flex w-full flex-col gap-2">
					<TextButton
						title={ts.get.calendar.this_occurrence}
						onclick={onThisOccurrence}
						type={action === 'delete' ? 'danger' : 'action'}
						class="w-full"
					/>
					<TextButton
						title={ts.get.calendar.all_occurrences}
						onclick={onAllOccurrences}
						type={action === 'delete' ? 'danger' : 'action'}
						class="w-full"
					/>
					<TextButton
						title={ts.get.layout.modal_cancel}
						onclick={onCancel}
						class="w-full"
					/>
				</div>
			</div>
		</div>
	</div>
{/if}
