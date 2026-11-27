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
		name: 'brick-wall',
		size: 24,
		node: [
			['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
			['path', { d: 'M12 9v6' }],
			['path', { d: 'M16 15v6' }],
			['path', { d: 'M16 3v6' }],
			['path', { d: 'M3 15h18' }],
			['path', { d: 'M3 9h18' }],
			['path', { d: 'M8 15v6' }],
			['path', { d: 'M8 3v6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
