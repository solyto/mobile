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
		name: 'whole-word',
		size: 24,
		node: [
			['circle', { cx: '7', cy: '12', r: '3' }],
			['path', { d: 'M10 9v6' }],
			['circle', { cx: '17', cy: '12', r: '3' }],
			['path', { d: 'M14 7v8' }],
			['path', { d: 'M22 17v1c0 .5-.5 1-1 1H3c-.5 0-1-.5-1-1v-1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
