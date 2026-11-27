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
		name: 'database-arrow-down',
		size: 24,
		node: [
			['path', { d: 'm16 19 3 3 3-3' }],
			['path', { d: 'M19 16v6' }],
			['path', { d: 'M21 12.536V5' }],
			['path', { d: 'M3 12A9 3 0 0 0 15.182 14.806' }],
			['path', { d: 'M3 5V19A9 3 0 0 0 13.318 21.968' }],
			['ellipse', { cx: '12', cy: '5', rx: '9', ry: '3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
