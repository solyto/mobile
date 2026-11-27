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
		name: 'vector-square',
		size: 24,
		node: [
			['path', { d: 'M17.055 4.533a24 24 0 00-10.11 0' }],
			['path', { d: 'M19.467 17.055a24 24 0 000-10.11' }],
			['path', { d: 'M4.533 6.945a24 24 0 000 10.11' }],
			['path', { d: 'M6.945 19.467a24 24 0 0010.11 0' }],
			['circle', { cx: '19', cy: '19', r: '2' }],
			['circle', { cx: '19', cy: '5', r: '2' }],
			['circle', { cx: '5', cy: '19', r: '2' }],
			['circle', { cx: '5', cy: '5', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
