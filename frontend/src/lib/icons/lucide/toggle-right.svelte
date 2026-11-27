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
		name: 'toggle-right',
		size: 24,
		node: [
			['circle', { cx: '15', cy: '12', r: '3' }],
			['rect', { width: '20', height: '14', x: '2', y: '5', rx: '7' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
