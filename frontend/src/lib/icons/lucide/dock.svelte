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
		name: 'dock',
		size: 24,
		node: [
			['path', { d: 'M2 8h20' }],
			['rect', { width: '20', height: '16', x: '2', y: '4', rx: '2' }],
			['path', { d: 'M6 16h12' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
