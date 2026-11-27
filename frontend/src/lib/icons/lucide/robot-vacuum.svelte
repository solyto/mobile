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
		name: 'robot-vacuum',
		size: 24,
		node: [
			['path', { d: 'M11 17h2' }],
			['path', { d: 'M12 12h.01' }],
			['path', { d: 'M17 12a5 5 0 00-10 0' }],
			['path', { d: 'M19 2v2.8' }],
			['path', { d: 'M2 5h2.8' }],
			['path', { d: 'M22 5h-2.8' }],
			['path', { d: 'M5 2v2.8' }],
			['circle', { cx: '12', cy: '12', r: '10' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
