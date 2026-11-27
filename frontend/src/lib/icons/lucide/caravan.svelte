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
		name: 'caravan',
		size: 24,
		node: [
			['path', { d: 'M18 19V9a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v8a2 2 0 0 0 2 2h2' }],
			['path', { d: 'M2 9h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2' }],
			['path', { d: 'M22 17v1a1 1 0 0 1-1 1H10v-9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v9' }],
			['circle', { cx: '8', cy: '19', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
