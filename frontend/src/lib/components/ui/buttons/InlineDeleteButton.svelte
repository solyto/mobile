<script lang="ts">
	import IconTrash from '$lib/icons/lucide/trash.svelte';
	import InlineActionButton from '$lib/components/ui/buttons/InlineActionButton.svelte';

	let { onClick, label = null, class: customClass = '' }: {
		onClick: (e: MouseEvent) => void | Promise<void>;
		label?: string | null;
		class?: string;
	} = $props();
</script>

<InlineActionButton {onClick} {label} icon={IconTrash} color="text-c-danger" fill="bg-c-danger" class={customClass} />
