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
		name: 'joystick',
		size: 24,
		node: [
			['path', { d: 'M21 17a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2Z' }],
			['path', { d: 'M6 15v-2' }],
			['path', { d: 'M12 15V9' }],
			['circle', { cx: '12', cy: '6', r: '3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
