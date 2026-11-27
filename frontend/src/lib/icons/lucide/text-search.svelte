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
		name: 'text-search',
		size: 24,
		node: [
			['path', { d: 'M21 5H3' }],
			['path', { d: 'M10 12H3' }],
			['path', { d: 'M10 19H3' }],
			['circle', { cx: '17', cy: '15', r: '3' }],
			['path', { d: 'm21 19-1.9-1.9' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
