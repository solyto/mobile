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
		name: 'calendar-clock',
		size: 24,
		node: [
			['path', { d: 'M16 14v2.2l1.6 1' }],
			['path', { d: 'M16 2v3' }],
			['path', { d: 'M21 7.338V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h2.338' }],
			['path', { d: 'M3 9h5.859' }],
			['path', { d: 'M8 2v3' }],
			['circle', { cx: '16', cy: '16', r: '6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
