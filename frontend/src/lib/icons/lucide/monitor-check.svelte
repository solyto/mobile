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
		name: 'monitor-check',
		size: 24,
		node: [
			['path', { d: 'm9 10 2 2 4-4' }],
			['rect', { width: '20', height: '14', x: '2', y: '3', rx: '2' }],
			['path', { d: 'M12 17v4' }],
			['path', { d: 'M8 21h8' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
