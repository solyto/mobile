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
		name: 'graph-star',
		size: 24,
		node: [
			['path', { d: 'm12.342 9.316 1.764-3.527' }],
			['path', { d: 'm12.59 14.545 2.35 3.759' }],
			['path', { d: 'm13.982 12.332 4.03.447' }],
			['path', { d: 'M5.414 17.586 8.88 14.12' }],
			['path', { d: 'M9.025 9.742 5.317 5.505' }],
			['circle', { cx: '11', cy: '12', r: '3' }],
			['circle', { cx: '15', cy: '4', r: '2' }],
			['circle', { cx: '16', cy: '20', r: '2' }],
			['circle', { cx: '20', cy: '13', r: '2' }],
			['circle', { cx: '4', cy: '19', r: '2' }],
			['circle', { cx: '4', cy: '4', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
