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
		name: 'between-vertical-start',
		size: 24,
		node: [
			['rect', { width: '7', height: '13', x: '3', y: '8', rx: '1' }],
			['path', { d: 'm15 2-3 3-3-3' }],
			['rect', { width: '7', height: '13', x: '14', y: '8', rx: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
