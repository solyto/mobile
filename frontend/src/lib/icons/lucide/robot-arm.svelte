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
		name: 'robot-arm',
		size: 24,
		node: [
			['path', { d: 'M12 21 7.5 8.322' }],
			['path', { d: 'm14 7 1.75-3.767a.5.5 0 0 1 .662-.172L20 5.005' }],
			['path', { d: 'm20 8.998-3.588 1.944a.5.5 0 0 1-.662-.172L14 7H8' }],
			['path', { d: 'M3.486 21h10' }],
			['path', { d: 'M5 21V8.732' }],
			['circle', { cx: '6', cy: '7', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
