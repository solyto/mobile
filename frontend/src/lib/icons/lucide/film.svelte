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
		name: 'film',
		size: 24,
		node: [
			['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
			['path', { d: 'M7 3v18' }],
			['path', { d: 'M3 7.5h4' }],
			['path', { d: 'M3 12h18' }],
			['path', { d: 'M3 16.5h4' }],
			['path', { d: 'M17 3v18' }],
			['path', { d: 'M17 7.5h4' }],
			['path', { d: 'M17 16.5h4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
