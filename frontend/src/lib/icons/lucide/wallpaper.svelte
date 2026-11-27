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
		name: 'wallpaper',
		size: 24,
		node: [
			['path', { d: 'M12 17v4' }],
			['path', { d: 'M8 21h8' }],
			['path', { d: 'm9 17 6.1-6.1a2 2 0 0 1 2.81.01L22 15' }],
			['circle', { cx: '8', cy: '9', r: '2' }],
			['rect', { x: '2', y: '3', width: '20', height: '14', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
