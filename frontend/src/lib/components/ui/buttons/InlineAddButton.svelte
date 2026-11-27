<script lang="ts">
	import IconPlus from '$lib/icons/lucide/plus.svelte';
	import InlineActionButton from '$lib/components/ui/buttons/InlineActionButton.svelte';

	let { onClick, label = null }: {
		onClick: (e: MouseEvent) => void | Promise<void>;
		label?: string | null;
	} = $props();
</script>

<InlineActionButton {onClick} {label} icon={IconPlus} color="text-c-btn" fill="bg-c-btn" />
