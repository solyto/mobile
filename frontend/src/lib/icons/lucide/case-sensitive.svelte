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
		name: 'case-sensitive',
		size: 24,
		node: [
			['path', { d: 'm2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16' }],
			['path', { d: 'M22 9v7' }],
			['path', { d: 'M3.304 13h6.392' }],
			['circle', { cx: '18.5', cy: '12.5', r: '3.5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
