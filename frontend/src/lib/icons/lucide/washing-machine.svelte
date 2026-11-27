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
		name: 'washing-machine',
		size: 24,
		node: [
			['path', { d: 'M3 6h3' }],
			['path', { d: 'M17 6h.01' }],
			['rect', { width: '18', height: '20', x: '3', y: '2', rx: '2' }],
			['circle', { cx: '12', cy: '13', r: '5' }],
			['path', { d: 'M12 18a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 1 0-5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
