<script lang="ts">
	import IconFileText from '@lucide/svelte/icons/file-text';
	import { formatFileSize } from '$lib/helpers/FormatHelper';
	import { getTranslation } from '$lib/state/Translation.svelte';

	let { name, size }: { name: string; size: number } = $props();

	const ts = getTranslation();
</script>

<div class="flex items-center gap-3 pr-16">
	<IconFileText class="size-6 shrink-0 text-c-neutral-4" />
	<div class="min-w-0">
		<p class="truncate text-sm">{name}</p>
		<p class="text-xs text-c-neutral-4">{formatFileSize(size, ts.locale)}</p>
	</div>
</div>
