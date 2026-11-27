<!--
@lucide/svelte v1.59.0 - ISC

This source code is licensed under the ISC license.
See the LICENSE file in this directory.
-->
<script lang="ts">
	import Icon from './Icon.svelte';
	import type { LucideIconData, LucideProps } from './types';

	const props: LucideProps = $props();

	const iconData: LucideIconData = {
		name: 'turtle',
		size: 24,
		node: [
			['path', { d: 'm12 10 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a8 8 0 1 0-16 0v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3l2-4h4Z' }],
			['path', { d: 'M4.82 7.9 8 10' }],
			['path', { d: 'M15.18 7.9 12 10' }],
			['path', { d: 'M16.93 10H20a2 2 0 0 1 0 4H2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
