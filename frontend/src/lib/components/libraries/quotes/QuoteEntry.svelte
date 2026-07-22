<script lang="ts">
	import IconTrash from '@lucide/svelte/icons/trash-2';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { QuoteLibrary } from '$lib/state/QuoteLibrary.svelte';
	import type { Quote } from '$lib/types/library_quote';
	import { nl2br } from '$lib/helpers/FormatHelper.js';
	import DOMPurify from 'dompurify';

	let { entry, library } = $props<{
		entry: Quote;
		library: QuoteLibrary;
	}>();

	const loadingIndicator = getLoadingIndicator();

	async function onDelete(e: MouseEvent) {
		e.preventDefault();
		loadingIndicator.start();
		await library.delete(entry);
		loadingIndicator.stop();
	}
</script>

<div class="ml-2 text-left">
	<div class="">
		{@html DOMPurify.sanitize(entry.summary ? nl2br(entry.summary) : nl2br(entry.quote))}
	</div>
	<div class="mt-4 font-bold">{entry.author}</div>
</div>
<div class="ml-auto flex h-full flex-row items-start gap-4 max-md:mt-2">
	<button class="cursor-pointer" onclick={(e: MouseEvent) => onDelete(e)}>
		<IconTrash class="text-c-danger" />
	</button>
</div>
