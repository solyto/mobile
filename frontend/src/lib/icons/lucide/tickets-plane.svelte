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
		name: 'tickets-plane',
		size: 24,
		node: [
			['path', { d: 'M10.5 17h1.227a2 2 0 0 0 1.345-.52L18 12' }],
			['path', { d: 'm12 13.5 3.794.506' }],
			['path', { d: 'm3.173 8.18 11-5a2 2 0 0 1 2.647.993L18.56 8' }],
			['path', { d: 'M6 10V8' }],
			['path', { d: 'M6 14v1' }],
			['path', { d: 'M6 19v2' }],
			['rect', { x: '2', y: '8', width: '20', height: '13', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
