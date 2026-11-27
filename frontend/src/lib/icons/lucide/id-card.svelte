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
		name: 'id-card',
		size: 24,
		node: [
			['path', { d: 'M13 19a4 4 0 00-8 0' }],
			['path', { d: 'M16 10h2' }],
			['path', { d: 'M16 14h2' }],
			['circle', { cx: '9', cy: '12', r: '3' }],
			['rect', { x: '2', y: '5', width: '20', height: '14', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
