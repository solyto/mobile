<script lang="ts">
	import PopupConfirmationModal from '$lib/components/ui/PopupConfirmationModal.svelte';
	import BottomSheetConfirmationModal from '$lib/components/ui/BottomSheetConfirmationModal.svelte';
	import { getViewPoint } from '$lib/state/Viewpoint.svelte';

	const viewPoint = getViewPoint();

	let props = $props();
</script>

{#if viewPoint.isMobile}
	<BottomSheetConfirmationModal {...props}>
		{@render props.children?.()}
	</BottomSheetConfirmationModal>
{:else}
	<PopupConfirmationModal {...props}>
		{@render props.children?.()}
	</PopupConfirmationModal>
{/if}