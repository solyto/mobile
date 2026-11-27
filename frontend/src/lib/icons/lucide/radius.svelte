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
		name: 'radius',
		size: 24,
		node: [
			['path', { d: 'M20.34 17.52a10 10 0 1 0-2.82 2.82' }],
			['circle', { cx: '19', cy: '19', r: '2' }],
			['path', { d: 'm13.41 13.41 4.18 4.18' }],
			['circle', { cx: '12', cy: '12', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
