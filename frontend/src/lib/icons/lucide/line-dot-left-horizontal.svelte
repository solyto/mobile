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
		name: 'line-dot-left-horizontal',
		size: 24,
		node: [
			['path', { d: 'M9 12h12' }],
			['circle', { cx: '6', cy: '12', r: '3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
