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
		name: 'shopping-cart-minus',
		size: 24,
		node: [
			['path', { d: 'M16 5h6' }],
			['path', { d: 'm2.05 2.05 1.099-.028a1 1 0 011.008.815l2.69 14.347A1 1 0 007.83 18H18' }],
			['path', { d: 'M4.564 5H12' }],
			['path', { d: 'M6.25 14h12.712a2 2 0 001.991-1.57l.514-3.113' }],
			['circle', { cx: '18', cy: '20', r: '2' }],
			['circle', { cx: '8', cy: '20', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
