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
		name: 'grip-vertical',
		size: 24,
		node: [
			['circle', { cx: '9', cy: '12', r: '1' }],
			['circle', { cx: '9', cy: '5', r: '1' }],
			['circle', { cx: '9', cy: '19', r: '1' }],
			['circle', { cx: '15', cy: '12', r: '1' }],
			['circle', { cx: '15', cy: '5', r: '1' }],
			['circle', { cx: '15', cy: '19', r: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
