<script lang="ts">
	import type { Quote } from '$lib/types/library_quote';
	import { nl2br } from '$lib/helpers/FormatHelper.js';
	import DOMPurify from 'dompurify';

	let { entry }: {
		entry: Quote;
	} = $props();
</script>

<div class="text-left">
	<div class="text-base leading-relaxed tracking-wide md:text-lg">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitised with DOMPurify -->
		{@html DOMPurify.sanitize(entry.summary ? nl2br(entry.summary) : nl2br(entry.quote))}
	</div>
	{#if entry.author}
		<div class="mt-2 text-sm font-bold">{entry.author}</div>
	{/if}
</div>
