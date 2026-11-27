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
		name: 'route-off',
		size: 24,
		node: [
			['circle', { cx: '6', cy: '19', r: '3' }],
			['path', { d: 'M9 19h8.5c.4 0 .9-.1 1.3-.2' }],
			['path', { d: 'M5.2 5.2A3.5 3.53 0 0 0 6.5 12H12' }],
			['path', { d: 'm2 2 20 20' }],
			['path', { d: 'M21 15.3a3.5 3.5 0 0 0-3.3-3.3' }],
			['path', { d: 'M15 5h-4.3' }],
			['circle', { cx: '18', cy: '5', r: '3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
