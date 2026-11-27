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
		name: 'globe-lock',
		size: 24,
		node: [
			['path', { d: 'M15.686 15A14.5 14.5 0 0 1 12 22a14.5 14.5 0 0 1 0-20 10 10 0 1 0 9.542 13' }],
			['path', { d: 'M2 12h8.5' }],
			['path', { d: 'M20 6V4a2 2 0 1 0-4 0v2' }],
			['rect', { width: '8', height: '5', x: '14', y: '6', rx: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
