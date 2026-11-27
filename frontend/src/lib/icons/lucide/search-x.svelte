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
		name: 'search-x',
		size: 24,
		node: [
			['path', { d: 'm13.5 8.5-5 5' }],
			['path', { d: 'm8.5 8.5 5 5' }],
			['circle', { cx: '11', cy: '11', r: '8' }],
			['path', { d: 'm21 21-4.3-4.3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
