<script lang="ts">
	import type { Component } from 'svelte';
	import { setFinances, type Finances } from '$lib/state/Finances.svelte';
	import { setTags, type Tags } from '$lib/state/Tags.svelte';

	let {
		component: Inner,
		props = {},
		onReady
	}: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		component: Component<any>;
		props?: Record<string, unknown>;
		onReady: (finances: Finances, tags: Tags) => void;
	} = $props();

	const finances = setFinances();
	const tags = setTags();
	// svelte-ignore state_referenced_locally
	onReady(finances, tags);
</script>

<Inner {...props} />
