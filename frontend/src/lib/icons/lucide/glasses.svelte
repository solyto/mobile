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
		name: 'glasses',
		size: 24,
		node: [
			['circle', { cx: '6', cy: '15', r: '4' }],
			['circle', { cx: '18', cy: '15', r: '4' }],
			['path', { d: 'M14 15a2 2 0 0 0-2-2 2 2 0 0 0-2 2' }],
			['path', { d: 'M2.5 13 5 7c.7-1.3 1.4-2 3-2' }],
			['path', { d: 'M21.5 13 19 7c-.7-1.3-1.5-2-3-2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
