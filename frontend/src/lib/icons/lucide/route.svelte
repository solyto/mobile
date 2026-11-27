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
		name: 'route',
		size: 24,
		node: [
			['circle', { cx: '6', cy: '19', r: '3' }],
			['path', { d: 'M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15' }],
			['circle', { cx: '18', cy: '5', r: '3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
