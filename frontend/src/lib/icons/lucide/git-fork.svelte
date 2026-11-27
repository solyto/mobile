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
		name: 'git-fork',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '18', r: '3' }],
			['circle', { cx: '6', cy: '6', r: '3' }],
			['circle', { cx: '18', cy: '6', r: '3' }],
			['path', { d: 'M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9' }],
			['path', { d: 'M12 12v3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
