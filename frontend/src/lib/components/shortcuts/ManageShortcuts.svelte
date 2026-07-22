<script lang="ts">
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getShortcuts } from '$lib/state/Shortcuts.svelte';
	import type { CreateShortcutRequest } from '$lib/types/shortcut.js';
	import type { Shortcut } from '$lib/types/shortcut.js';
	import ShotcutEdit from '$lib/components/shortcuts/ShortcutEdit.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import SaveButton from '$lib/components/ui/buttons/SaveButton.svelte';
	import AddButton from '$lib/components/ui/buttons/AddButton.svelte';
	import { getKeyManager } from '$lib/KeyManager.svelte';
	import { onDestroy, tick } from 'svelte';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import IconGripVertical from '@lucide/svelte/icons/grip-vertical';

	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const shortcuts = getShortcuts();
	const keyManager = getKeyManager();

	let { onClose } = $props<{ onClose: () => void }>();

	const flipDurationMs = 200;
	let items = $state<Shortcut[]>([]);
	let dragDisabled = $state(true);

	$effect(() => {
		items = shortcuts.shortcuts;
	});

	function handleConsider(e: CustomEvent) {
		items = e.detail.items;
	}

	async function handleFinalize(e: CustomEvent) {
		items = e.detail.items;
		dragDisabled = true;
		await shortcuts.reorder(items.map((s) => s.id));
	}

	let create = $state<boolean>(false);
	let titleValue = $state<string>('');
	let urlValue = $state<string>('');
	let titleInput = $state<HTMLInputElement | null>(null);
	let keyHandlers = $state<{ Enter: string | null; Escape: string | null }>({ Enter: null, Escape: null });

	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	async function onCreate() {
		if (titleValue === '' || urlValue === '') {
			return;
		}

		loadingIndicator.start();
		const request: CreateShortcutRequest = {
			title: titleValue,
			url: urlValue
		};
		await shortcuts.create(request);
		loadingIndicator.stop();
		await toggleCreate();
	}

	async function toggleCreate() {
		create = !create;
		if (create) {
			keyHandlers.Enter = keyManager.registerKeyDown('Enter', onCreate);
			keyHandlers.Escape = keyManager.registerKeyDown('Escape', toggleCreate);
			await tick();
			titleInput?.focus();
		} else {
			keyManager.unregisterAll(keyHandlers);
			keyHandlers = { Enter: null, Escape: null };
		}
	}
</script>

<ContentModal title={ts.get.widgets.manage_shortcuts} rounded="2xl" p="4" {onClose}>
	<div class="flex w-full flex-col gap-0">
		<div
			use:dndzone={{
				items,
				flipDurationMs,
				dragDisabled,
				dropTargetClasses: ['shadow-lg', 'ring-2', 'ring-d-lightblue']
			}}
			onconsider={handleConsider}
			onfinalize={handleFinalize}
			class="flex flex-col !outline-0"
		>
			{#each items as shortcut (shortcut.id)}
				<div class="flex items-center gap-1" animate:flip={{ duration: flipDurationMs }}>
					<IconGripVertical
						size={16}
						class="shrink-0 cursor-grab text-c-neutral-3"
						onpointerdown={() => (dragDisabled = false)}
						onpointerup={() => (dragDisabled = true)}
					/>
					<ShotcutEdit {shortcut} />
				</div>
			{/each}
		</div>
		<div class="mt-4 flex w-full justify-center">
			{#if create}
				<div class="flex w-full items-center gap-2">
					<TextInput
						bind:input={titleInput}
						bind:value={titleValue}
						placeholder={ts.get.widgets.shortcut_title}
					/>
					<TextInput bind:value={urlValue} placeholder={ts.get.widgets.shortcut_url} />
					<SaveButton
						onClick={() => {
							onCreate();
						}}
					/>
				</div>
			{:else}
				<AddButton
					onClick={() => {
						toggleCreate();
					}}
				/>
			{/if}
		</div>
	</div>
</ContentModal>
