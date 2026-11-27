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
		name: 'aperture',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '12', r: '10' }],
			['path', { d: 'm14.31 8 5.74 9.94' }],
			['path', { d: 'M9.69 8h11.48' }],
			['path', { d: 'm7.38 12 5.74-9.94' }],
			['path', { d: 'M9.69 16 3.95 6.06' }],
			['path', { d: 'M14.31 16H2.83' }],
			['path', { d: 'm16.62 12-5.74 9.94' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
