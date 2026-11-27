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
		name: 'mouse',
		size: 24,
		node: [
			['rect', { x: '5', y: '2', width: '14', height: '20', rx: '7' }],
			['path', { d: 'M12 6v4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
