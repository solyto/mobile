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
		name: 'mirror-rectangular',
		size: 24,
		node: [
			['path', { d: 'M11 6 8 9' }],
			['path', { d: 'm16 7-8 8' }],
			['rect', { x: '4', y: '2', width: '16', height: '20', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
