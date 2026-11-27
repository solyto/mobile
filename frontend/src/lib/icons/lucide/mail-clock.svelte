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
		name: 'mail-clock',
		size: 24,
		node: [
			['path', { d: 'M16 14v2.2l1.6 1' }],
			['path', { d: 'm22 7-.759.484' }],
			['path', { d: 'M6.835 20H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v2' }],
			['path', { d: 'M7.605 10.567 2 7' }],
			['circle', { cx: '16', cy: '16', r: '6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
