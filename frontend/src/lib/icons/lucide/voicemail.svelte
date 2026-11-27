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
		name: 'voicemail',
		size: 24,
		node: [
			['circle', { cx: '6', cy: '12', r: '4' }],
			['circle', { cx: '18', cy: '12', r: '4' }],
			['line', { x1: '6', x2: '18', y1: '16', y2: '16' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
