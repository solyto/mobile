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
		name: 'captions',
		size: 24,
		node: [
			['rect', { width: '18', height: '14', x: '3', y: '5', rx: '2', ry: '2' }],
			['path', { d: 'M7 15h4M15 15h2M7 11h2M13 11h4' }]
		],
		aliases: ['subtitles']
	};
</script>

<Icon {...props} icon={iconData} />
