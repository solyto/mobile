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
		name: 'rose',
		size: 24,
		node: [
			['path', { d: 'M17 10h-1a4 4 0 1 1 4-4v.534' }],
			['path', { d: 'M17 6h1a4 4 0 0 1 1.42 7.74l-2.29.87a6 6 0 0 1-5.339-10.68l2.069-1.31' }],
			['path', { d: 'M4.5 17c2.8-.5 4.4 0 5.5.8s1.8 2.2 2.3 3.7c-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2' }],
			['path', { d: 'M9.77 12C4 15 2 22 2 22' }],
			['circle', { cx: '17', cy: '8', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
