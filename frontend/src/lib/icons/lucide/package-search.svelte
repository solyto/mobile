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
		name: 'package-search',
		size: 24,
		node: [
			['path', { d: 'M12 22V12' }],
			['path', { d: 'M20.27 18.27 22 20' }],
			['path', { d: 'M21 10.498V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.729l7 4a2 2 0 0 0 2 .001l.98-.559' }],
			['path', { d: 'M3.29 7 12 12l8.71-5' }],
			['path', { d: 'm7.5 4.27 8.997 5.148' }],
			['circle', { cx: '18.5', cy: '16.5', r: '2.5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
