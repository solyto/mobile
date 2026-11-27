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
		name: 'grip-horizontal',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '9', r: '1' }],
			['circle', { cx: '19', cy: '9', r: '1' }],
			['circle', { cx: '5', cy: '9', r: '1' }],
			['circle', { cx: '12', cy: '15', r: '1' }],
			['circle', { cx: '19', cy: '15', r: '1' }],
			['circle', { cx: '5', cy: '15', r: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
