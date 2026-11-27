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
		name: 'stethoscope',
		size: 24,
		node: [
			['path', { d: 'M11 2v2' }],
			['path', { d: 'M5 2v2' }],
			['path', { d: 'M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1' }],
			['path', { d: 'M8 15a6 6 0 0 0 12 0v-3' }],
			['circle', { cx: '20', cy: '10', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
