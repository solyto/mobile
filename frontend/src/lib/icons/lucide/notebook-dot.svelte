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
		name: 'notebook-dot',
		size: 24,
		node: [
			['path', { d: 'M16 11.75V22' }],
			['path', { d: 'M2 10h4' }],
			['path', { d: 'M2 14h4' }],
			['path', { d: 'M2 18h4' }],
			['path', { d: 'M2 6h4' }],
			['path', { d: 'M20 11.75V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h5.65' }],
			['circle', { cx: '18', cy: '5', r: '3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
