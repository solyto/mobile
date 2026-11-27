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
		name: 'orbit',
		size: 24,
		node: [
			['path', { d: 'M20.341 6.484A10 10 0 0 1 10.266 21.85' }],
			['path', { d: 'M3.659 17.516A10 10 0 0 1 13.74 2.152' }],
			['circle', { cx: '12', cy: '12', r: '3' }],
			['circle', { cx: '19', cy: '5', r: '2' }],
			['circle', { cx: '5', cy: '19', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
