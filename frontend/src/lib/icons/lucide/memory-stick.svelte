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
		name: 'memory-stick',
		size: 24,
		node: [
			['path', { d: 'M12 12v-2' }],
			['path', { d: 'M12 18v-2' }],
			['path', { d: 'M16 12v-2' }],
			['path', { d: 'M16 18v-2' }],
			['path', { d: 'M2 11h1.5' }],
			['path', { d: 'M20 18v-2' }],
			['path', { d: 'M20.5 11H22' }],
			['path', { d: 'M4 18v-2' }],
			['path', { d: 'M8 12v-2' }],
			['path', { d: 'M8 18v-2' }],
			['rect', { x: '2', y: '6', width: '20', height: '10', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
