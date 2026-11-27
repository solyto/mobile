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
		name: 'package',
		size: 24,
		node: [
			['path', { d: 'M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z' }],
			['path', { d: 'M12 22V12' }],
			['polyline', { points: '3.29 7 12 12 20.71 7' }],
			['path', { d: 'm7.5 4.27 9 5.15' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
