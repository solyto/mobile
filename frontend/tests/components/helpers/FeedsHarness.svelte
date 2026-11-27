<script lang="ts">
	import type { AnyComponent } from './context';
	import { setFeeds, type Feeds } from '$lib/state/Feeds.svelte';
	import { setFeedImport, type FeedImport } from '$lib/state/FeedImport.svelte';

	let { component: ComponentToRender, props = {}, setup = () => {} }: {
		component: AnyComponent;
		props?: Record<string, unknown>;
		setup?: (feeds: Feeds, feedImport: FeedImport) => void;
	} = $props();

	const feeds = setFeeds();
	const feedImport = setFeedImport();
	// svelte-ignore state_referenced_locally
	setup(feeds, feedImport);
</script>

<ComponentToRender {...props} />
