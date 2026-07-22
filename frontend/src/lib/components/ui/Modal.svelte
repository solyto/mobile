<script lang="ts">
	import { scale, fade, blur } from 'svelte/transition';
	import { getKeyManager } from '$lib/KeyManager.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { onDestroy, onMount } from 'svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import Divider from '$lib/components/ui/Divider.svelte';

	const ts = getTranslation(),
		keyManager = getKeyManager();

	let {
		title = null,
		description = null,
		type = 'default',
		width = 'w-96',
		onConfirm,
		onCancel,
		children
	} = $props<{
		title?: string;
		description?: string;
		type?: 'default' | 'confirm' | 'confirm-delete' | 'info';
		width?: string;
		onConfirm: () => void | Promise<any>;
		onCancel: () => void | Promise<any>;
		children?: any;
	}>();

	let visible = $state<boolean>(false);
	let keyHandlers = $state<{ [key: string]: string | null }>({ Enter: null, Escape: null });

	onMount(() => {
		setTimeout(() => {
			visible = true;
		}, 0);
	});

	onMount(() => {
		keyHandlers.Enter = keyManager.registerKeyDown('Enter', handleEnter);
		keyHandlers.Escape = keyManager.registerKeyDown('Escape', handleEscape);
	});

	function handleEscape(event: KeyboardEvent): void {
		onCancel();
		keyManager.unregisterAll(keyHandlers);
	}

	async function handleEnter(event: KeyboardEvent): Promise<void> {
		await onConfirm();
	}

	onDestroy(() => keyManager.unregisterAll(keyHandlers));
</script>

{#if visible}
	<div
		class="fixed top-0 left-0 z-[60] flex h-dvh w-screen justify-center bg-transparent backdrop-blur-xs transition-all modal-blur"
		out:fade
		in:blur={{ duration: 300 }}
	>
		<div
			class="relative my-auto flex justify-center p-8 max-md:w-[95%] max-md:p-0 modal-container"
			in:scale={{ start: 0.75 }}
		>
			{#if title}
				<div
					class="absolute top-[-20px] left-12 z-40 w-full text-2xl font-bold tracking-wide text-c-heading max-md:hidden dark:text-c-primary"
				>
					{title}
				</div>
			{/if}
			<div
				class="bg-c-bg-modal modal p-4 shadow-md {width} rounded-2xl border-1 border-c-neutral-2 dark:border-s-dark"
			>
				{#if type === 'default'}
					{@render children?.()}
				{:else}
					{#if description}
						<div class="w-full text-sm text-c-neutral-5">{description}</div>
					{/if}
					<div class="mt-4 w-full text-sm text-c-neutral-5 italic max-md:hidden">
						{ts.get.layout.modal_explanation}
					</div>
				{/if}
				<div class="mt-4 flex w-full flex-row justify-center gap-4">
					<TextButton title={ts.get.layout.modal_cancel} onclick={onCancel} />
					<TextButton
						title={ts.get.layout.modal_confirm}
						type={type === 'confirm-delete' ? 'danger' : 'action'}
						onclick={onConfirm}
					/>
				</div>
			</div>
		</div>
	</div>
{/if}
