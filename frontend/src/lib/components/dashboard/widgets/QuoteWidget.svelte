<script lang="ts">
	import { blur } from 'svelte/transition';
	import DOMPurify from 'dompurify';
	import IconQuote from '@lucide/svelte/icons/quote';
	import { nl2br } from '$lib/helpers/FormatHelper';
	import type { Quote } from '$lib/types/library_quote';

	let { quote }: { quote: Quote } = $props();
</script>

<div class="flex items-start gap-3" in:blur>
	<IconQuote size={15} class="mt-0.5 shrink-0 text-c-heading dark:text-c-primary" />
	<div class="flex flex-col gap-1.5">
		<p class="text-sm leading-relaxed text-c-neutral-7 dark:text-c-neutral-3">
			{@html DOMPurify.sanitize(nl2br(quote.quote))}
		</p>
		{#if quote.author}
			<span class="text-xs font-medium text-c-heading dark:text-c-primary">
				{quote.author}
			</span>
		{/if}
	</div>
</div>