<script lang="ts">
	import type { Tag } from '$lib/types/tag';
	import { fade } from 'svelte/transition';
	import ColorPicker from '$lib/components/forms/ColorPicker.svelte';
	import { getTags } from '$lib/state/Tags.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import DeleteButton from '$lib/components/ui/buttons/DeleteButton.svelte';
	import { clickOutside } from '$lib/helpers/ClickHelper';

	const tags = getTags();
	const loadingIndicator = getLoadingIndicator();

	let { tag }: { tag: Tag } = $props();

	let hex = $state<string>(tag.color !== null ? tag.color : 'var(--color-c-neutral-2)');
	let pickerOpen = $state<boolean>(false);

	async function onColorChange(): Promise<void> {
		if (!pickerOpen) return;
		pickerOpen = false;

		if (hex === tag.color) return;

		await withLoadingIndicator(() => tags.changeColor(tag, hex));
	}

	async function onDelete(): Promise<void> {
		await withLoadingIndicator(() => tags.delete(tag.id));
	}

	async function withLoadingIndicator(action: () => Promise<unknown>): Promise<void> {
		loadingIndicator.start();
		try {
			await action();
		} finally {
			loadingIndicator.stop();
		}
	}
</script>

<div
	class="lg:text-md flex items-center gap-1 rounded-full border-1 border-c-neutral-2 px-2 py-1 text-sm font-semibold lg:px-4 lg:py-2 dark:border-0 dark:bg-s-dark-2"
	in:fade={{ duration: 100 }}
>
	<div use:clickOutside={onColorChange}>
		<ColorPicker bind:hex bind:isOpen={pickerOpen} />
	</div>
	<span>#{tag.name}</span>
	<div class="ml-2">
		<DeleteButton onClick={onDelete} inModal={false} buttonStyle="minimal" />
	</div>
</div>
