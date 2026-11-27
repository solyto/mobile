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
		name: 'projector',
		size: 24,
		node: [
			['path', { d: 'M5 7 3 5' }],
			['path', { d: 'M9 6V3' }],
			['path', { d: 'm13 7 2-2' }],
			['circle', { cx: '9', cy: '13', r: '3' }],
			['path', { d: 'M11.83 12H20a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2.17' }],
			['path', { d: 'M16 16h2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
