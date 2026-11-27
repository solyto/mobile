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
		name: 'shower-head',
		size: 24,
		node: [
			['path', { d: 'm4 4 2.5 2.5' }],
			['path', { d: 'M13.5 6.5a4.95 4.95 0 0 0-7 7' }],
			['path', { d: 'M15 5 5 15' }],
			['path', { d: 'M14 17v.01' }],
			['path', { d: 'M10 16v.01' }],
			['path', { d: 'M13 13v.01' }],
			['path', { d: 'M16 10v.01' }],
			['path', { d: 'M11 20v.01' }],
			['path', { d: 'M17 14v.01' }],
			['path', { d: 'M20 11v.01' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
