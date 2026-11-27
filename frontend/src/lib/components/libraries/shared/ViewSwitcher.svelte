<script lang="ts">
	import UiViewSwitcher from '$lib/components/ui/ViewSwitcher.svelte';
	import type { ViewLibrary } from '$lib/types/library';
	import { getTranslation } from '$lib/state/Translation.svelte';

	let { library }: { library: ViewLibrary } = $props();

	const ts = getTranslation();

	function views() {
		const baseViews = [
			{ type: 'list' as const, title: ts.get.libraries.view_list },
			{ type: 'cards' as const, title: ts.get.libraries.view_cards }
		];
		const shelfViews = [
			{ type: 'spine' as const, title: ts.get.libraries.view_shelf },
			{ type: 'shelf' as const, title: ts.get.libraries.view_browse }
		];
		return library.config.hasShelf ? [...baseViews, ...shelfViews] : baseViews;
	}

	function onViewChange(type: string) {
		library.changeView(type);
	}
</script>

<div class="absolute top-0 left-0 hidden 2xl:block">
	<UiViewSwitcher views={views()} currentlySelected={library.view} onChange={onViewChange} />
</div>
