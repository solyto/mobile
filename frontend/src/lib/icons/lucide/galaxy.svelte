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
		name: 'galaxy',
		size: 24,
		node: [
			['path', { d: 'M16.005 15.108a5.041 6.52 28.25 00-8.008-6.217 5.041 6.52 28.25 008.008 6.217A11.884 7.288-60.76 014.029 7.001' }],
			['path', { d: 'M17 21h.01' }],
			['path', { d: 'M7 3h.01' }],
			['path', { d: 'M7.997 8.891a11.885 7.288-60.756 0111.977 8.107' }],
			['circle', { cx: '12', cy: '12', r: '1', fill: 'currentColor' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
