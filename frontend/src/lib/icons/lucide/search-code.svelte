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
		name: 'search-code',
		size: 24,
		node: [
			['path', { d: 'm13 13.5 2-2.5-2-2.5' }],
			['path', { d: 'm21 21-4.3-4.3' }],
			['path', { d: 'M9 8.5 7 11l2 2.5' }],
			['circle', { cx: '11', cy: '11', r: '8' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
