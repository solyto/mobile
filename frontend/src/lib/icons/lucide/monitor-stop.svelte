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
		name: 'monitor-stop',
		size: 24,
		node: [
			['path', { d: 'M12 17v4' }],
			['path', { d: 'M8 21h8' }],
			['rect', { x: '2', y: '3', width: '20', height: '14', rx: '2' }],
			['rect', { x: '9', y: '7', width: '6', height: '6', rx: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
