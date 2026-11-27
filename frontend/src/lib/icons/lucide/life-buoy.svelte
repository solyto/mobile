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
		name: 'life-buoy',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '12', r: '10' }],
			['path', { d: 'm4.93 4.93 4.24 4.24' }],
			['path', { d: 'm14.83 9.17 4.24-4.24' }],
			['path', { d: 'm14.83 14.83 4.24 4.24' }],
			['path', { d: 'm9.17 14.83-4.24 4.24' }],
			['circle', { cx: '12', cy: '12', r: '4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
