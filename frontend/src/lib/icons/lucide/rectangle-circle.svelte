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
		name: 'rectangle-circle',
		size: 24,
		node: [
			['path', { d: 'M14 4v16H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z' }],
			['circle', { cx: '14', cy: '12', r: '8' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
