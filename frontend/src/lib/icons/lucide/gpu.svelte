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
		name: 'gpu',
		size: 24,
		node: [
			['path', { d: 'M2 17h18a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H2' }],
			['path', { d: 'M2 21V3' }],
			['path', { d: 'M7 17v3a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-3' }],
			['circle', { cx: '16', cy: '11', r: '2' }],
			['circle', { cx: '8', cy: '11', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
