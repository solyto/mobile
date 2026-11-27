<script lang="ts">
	import IconChevronLeft from '$lib/icons/lucide/chevron-left.svelte';

	let { title, onclick }: { title: string; onclick: () => void } = $props();
</script>

<button type="button" class="flex cursor-pointer items-center gap-1 self-start text-sm" {onclick}>
	<IconChevronLeft class="size-4" />
	{title}
</button>
