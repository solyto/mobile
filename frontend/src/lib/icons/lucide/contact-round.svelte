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
		name: 'contact-round',
		size: 24,
		node: [
			['path', { d: 'M16 2v2' }],
			['path', { d: 'M17.915 21a6 6 0 10-12 0' }],
			['path', { d: 'M8 2v2' }],
			['circle', { cx: '12', cy: '11', r: '4' }],
			['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }]
		],
		aliases: ['contact-2']
	};
</script>

<Icon {...props} icon={iconData} />
