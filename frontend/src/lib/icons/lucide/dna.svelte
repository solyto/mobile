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
		name: 'dna',
		size: 24,
		node: [
			['path', { d: 'm10 16 1.5 1.5' }],
			['path', { d: 'm14 8-1.5-1.5' }],
			['path', { d: 'M15 2c-1.798 1.998-2.518 3.995-2.807 5.993' }],
			['path', { d: 'm16.5 10.5 1 1' }],
			['path', { d: 'm17 6-2.891-2.891' }],
			['path', { d: 'M2 15c6.667-6 13.333 0 20-6' }],
			['path', { d: 'm20 9 .891.891' }],
			['path', { d: 'M3.109 14.109 4 15' }],
			['path', { d: 'm6.5 12.5 1 1' }],
			['path', { d: 'm7 18 2.891 2.891' }],
			['path', { d: 'M9 22c1.798-1.998 2.518-3.995 2.807-5.993' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
