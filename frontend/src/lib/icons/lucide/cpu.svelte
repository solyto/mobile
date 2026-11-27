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
		name: 'cpu',
		size: 24,
		node: [
			['path', { d: 'M12 20v2' }],
			['path', { d: 'M12 2v2' }],
			['path', { d: 'M17 20v2' }],
			['path', { d: 'M17 2v2' }],
			['path', { d: 'M2 12h2' }],
			['path', { d: 'M2 17h2' }],
			['path', { d: 'M2 7h2' }],
			['path', { d: 'M20 12h2' }],
			['path', { d: 'M20 17h2' }],
			['path', { d: 'M20 7h2' }],
			['path', { d: 'M7 20v2' }],
			['path', { d: 'M7 2v2' }],
			['rect', { x: '4', y: '4', width: '16', height: '16', rx: '2' }],
			['rect', { x: '8', y: '8', width: '8', height: '8', rx: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
