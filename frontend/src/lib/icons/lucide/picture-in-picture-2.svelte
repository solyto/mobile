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
		name: 'picture-in-picture-2',
		size: 24,
		node: [
			['path', { d: 'M21 9V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h4' }],
			['rect', { width: '10', height: '7', x: '12', y: '13', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
