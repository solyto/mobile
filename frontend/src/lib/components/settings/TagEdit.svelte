<script lang="ts">
	import type { Tag } from '$lib/types/tag';
	import { fade } from 'svelte/transition';
	import ColorPicker from 'svelte-awesome-color-picker';
	import { getTags } from '$lib/state/Tags.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import DeleteButton from '$lib/components/ui/buttons/DeleteButton.svelte';
	import { clickOutside } from '$lib/helpers/ClickHelper';

	const tags = getTags();
	const loadingIndicator = getLoadingIndicator();

	let { tag } = $props<{ tag: Tag }>();

	let hex = $state<string>(tag.color !== null ? tag.color : 'var(--color-c-neutral-2)');

	async function onColorChange(): Promise<void> {
		if (hex === tag.color) return;

		loadingIndicator.start();
		await tags.changeColor(tag, hex);
		loadingIndicator.stop();
	}

	async function onDelete(tag: Tag): Promise<void> {
		loadingIndicator.start();
		await tags.delete(tag.id);
		loadingIndicator.stop();
	}
</script>

<div
	class="lg:text-md flex items-center gap-1 rounded-full border-1 border-c-neutral-2 px-2 py-1 text-sm font-semibold lg:px-4 lg:py-2 dark:border-0 dark:bg-s-dark-2"
	in:fade={{ duration: 100 }}
>
	<div use:clickOutside={onColorChange}>
		<ColorPicker
			bind:hex
			position="responsive"
			nullable={false}
			label=""
			isTextInput={false}
			--cp-border-color="var(--color-c-neutral-2)"
		/>
	</div>
	<span>#{tag.name}</span>
	<div class="ml-2">
		<DeleteButton onClick={() => onDelete(tag)} inModal={false} buttonStyle="minimal" />
	</div>
</div>
