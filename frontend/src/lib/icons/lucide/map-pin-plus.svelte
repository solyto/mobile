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
		name: 'map-pin-plus',
		size: 24,
		node: [
			['path', { d: 'M19.914 11.105A7.298 7.298 0 0 0 20 10a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 1.202 0 32 32 0 0 0 .824-.738' }],
			['circle', { cx: '12', cy: '10', r: '3' }],
			['path', { d: 'M16 18h6' }],
			['path', { d: 'M19 15v6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
