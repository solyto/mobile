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
		name: 'tv',
		size: 24,
		node: [
			['path', { d: 'm17 2-5 5-5-5' }],
			['rect', { width: '20', height: '15', x: '2', y: '7', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
