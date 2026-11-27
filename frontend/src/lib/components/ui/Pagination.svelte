<script lang="ts">
	import IconButton from '$lib/components/ui/buttons/IconButton.svelte';
	import IconChevronLeft from '$lib/icons/lucide/chevron-left.svelte';
	import IconChevronRight from '$lib/icons/lucide/chevron-right.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	let { page, lastPage, onchange }: { page: number; lastPage: number; onchange: (page: number) => void } = $props();

	const ts = getTranslation();

	function pageLabel(): string {
		return ts.get.layout.page_of.replace('{n}', String(page)).replace('{total}', String(lastPage));
	}

	function previous(): void {
		onchange(page - 1);
	}

	function next(): void {
		onchange(page + 1);
	}
</script>

<div class="flex items-center justify-center gap-3">
	<IconButton type="slight" label={ts.get.layout.previous_page} disabled={page <= 1} onclick={previous}>
		<IconChevronLeft class="size-5" />
	</IconButton>
	<span class="text-sm text-c-neutral-5 dark:text-c-neutral-4">
		{pageLabel()}
	</span>
	<IconButton type="slight" label={ts.get.layout.next_page} disabled={page >= lastPage} onclick={next}>
		<IconChevronRight class="size-5" />
	</IconButton>
</div>
