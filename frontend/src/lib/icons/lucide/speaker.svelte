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
		name: 'speaker',
		size: 24,
		node: [
			['rect', { width: '16', height: '20', x: '4', y: '2', rx: '2' }],
			['path', { d: 'M12 6h.01' }],
			['circle', { cx: '12', cy: '14', r: '4' }],
			['path', { d: 'M12 14h.01' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
