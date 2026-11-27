<script lang="ts">
	import IconPen from '$lib/icons/lucide/pen.svelte';
	import InlineActionButton from '$lib/components/ui/buttons/InlineActionButton.svelte';

	let { onClick, label = null }: {
		onClick: (e: MouseEvent) => void | Promise<void>;
		label?: string | null;
	} = $props();
</script>

<InlineActionButton {onClick} {label} icon={IconPen} color="text-c-btn" fill="bg-c-btn" />
