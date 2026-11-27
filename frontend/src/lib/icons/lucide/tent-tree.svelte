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
		name: 'tent-tree',
		size: 24,
		node: [
			['circle', { cx: '4', cy: '4', r: '2' }],
			['path', { d: 'm14 5 3-3 3 3' }],
			['path', { d: 'm14 10 3-3 3 3' }],
			['path', { d: 'M17 14V2' }],
			['path', { d: 'M17 14H7l-5 8h20Z' }],
			['path', { d: 'M8 14v8' }],
			['path', { d: 'm9 14 5 8' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
