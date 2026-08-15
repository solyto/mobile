<script lang="ts">
	import PopupContentModal from '$lib/components/ui/PopupContentModal.svelte';
	import BottomSheetModal from '$lib/components/ui/BottomSheetModal.svelte';
	import { getViewPoint } from '$lib/state/Viewpoint.svelte';

	const viewPoint = getViewPoint();

	let props = $props();
</script>

{#if props.forcePopup || !viewPoint.isMobile}
	<PopupContentModal {...props}>
		{@render props.children?.()}
	</PopupContentModal>
{:else}
	<BottomSheetModal {...props}>
		{@render props.children?.()}
	</BottomSheetModal>
{/if}