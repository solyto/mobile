<script lang="ts">
	import { onDestroy, tick } from 'svelte';
	import IconPen from '@lucide/svelte/icons/pen';
	import { getKeyManager } from '$lib/state/KeyManager.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import SaveButton from '$lib/components/ui/buttons/SaveButton.svelte';

	const keyManager = getKeyManager();
	const ts = getTranslation();

	let {
		title,
		onRename,
		class: titleClass = ''
	}: {
		title: string;
		onRename?: (title: string) => Promise<boolean>;
		class?: string;
	} = $props();

	let renaming = $state<boolean>(false);
	let renameTitle = $state<string>('');
	let input = $state<HTMLInputElement | null>(null);
	let keyHandlers: Record<string, string | null> = { Enter: null, Escape: null };

	async function startRename(): Promise<void> {
		keyManager.unregisterAll(keyHandlers);
		renameTitle = title;
		renaming = true;
		keyHandlers.Enter = keyManager.registerKeyDown('Enter', () => saveRename(), { priority: 2 });
		keyHandlers.Escape = keyManager.registerKeyDown('Escape', () => cancelRename(), { priority: 2 });
		await tick();
		input?.focus();
	}

	function cancelRename(): void {
		keyManager.unregisterAll(keyHandlers);
		renaming = false;
	}

	async function saveRename(): Promise<void> {
		const trimmed = renameTitle.trim();
		if (!trimmed || !onRename) return;
		if (trimmed === title || (await onRename(trimmed))) cancelRename();
	}

	onDestroy(() => keyManager.unregisterAll(keyHandlers));
</script>

{#if renaming}
	<div class="flex w-80 max-w-full items-center gap-2 max-md:max-w-[calc(100%-3rem)]">
		<TextInput bind:input bind:value={renameTitle} placeholder={ts.get.layout.rename} />
		<SaveButton onClick={saveRename} />
	</div>
{:else}
	<div class="flex items-center gap-3">
		<span class={titleClass}>{title}</span>
		{#if onRename}
			<button
				type="button"
				class="cursor-pointer"
				aria-label={ts.get.layout.rename}
				title={ts.get.layout.rename}
				onclick={startRename}
			>
				<IconPen class="size-5 text-c-neutral-3 transition-all hover:text-c-action" />
			</button>
		{/if}
	</div>
{/if}
