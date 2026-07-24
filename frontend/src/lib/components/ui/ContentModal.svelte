<script lang="ts">
	import PopupContentModal from '$lib/components/ui/PopupContentModal.svelte';
	import BottomSheetModal from '$lib/components/ui/BottomSheetModal.svelte';
	import { getViewPoint } from '$lib/state/Viewpoint.svelte';

	const viewPoint = getViewPoint();

	let props = $props();
</script>

{#if viewPoint.isMobile}
	<BottomSheetModal {...props}>
		{@render props.children?.()}
	</BottomSheetModal>
{:else}
	<PopupContentModal {...props}>
		{@render props.children?.()}
	</PopupContentModal>
{/if}