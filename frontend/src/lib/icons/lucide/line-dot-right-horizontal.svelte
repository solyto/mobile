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
		name: 'line-dot-right-horizontal',
		size: 24,
		node: [
			['path', { d: 'M 3 12 L 15 12' }],
			['circle', { cx: '18', cy: '12', r: '3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
