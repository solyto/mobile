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
		name: 'scissors',
		size: 24,
		node: [
			['circle', { cx: '6', cy: '6', r: '3' }],
			['path', { d: 'M8.12 8.12 12 12' }],
			['path', { d: 'M20 4 8.12 15.88' }],
			['circle', { cx: '6', cy: '18', r: '3' }],
			['path', { d: 'M14.8 14.8 20 20' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
