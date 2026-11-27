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
		name: 'hotel',
		size: 24,
		node: [
			['path', { d: 'M10 22v-6.57' }],
			['path', { d: 'M12 11h.01' }],
			['path', { d: 'M12 7h.01' }],
			['path', { d: 'M14 15.43V22' }],
			['path', { d: 'M15 16a5 5 0 0 0-6 0' }],
			['path', { d: 'M16 11h.01' }],
			['path', { d: 'M16 7h.01' }],
			['path', { d: 'M8 11h.01' }],
			['path', { d: 'M8 7h.01' }],
			['rect', { x: '4', y: '2', width: '16', height: '20', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
