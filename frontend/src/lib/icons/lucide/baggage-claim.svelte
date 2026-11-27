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
		name: 'baggage-claim',
		size: 24,
		node: [
			['path', { d: 'M22 18H6a2 2 0 0 1-2-2V7a2 2 0 0 0-2-2' }],
			['path', { d: 'M17 14V4a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v10' }],
			['rect', { width: '13', height: '8', x: '8', y: '6', rx: '1' }],
			['circle', { cx: '18', cy: '20', r: '2' }],
			['circle', { cx: '9', cy: '20', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
