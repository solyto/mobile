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
		name: 'tv-minimal-play',
		size: 24,
		node: [
			['path', { d: 'M15.033 9.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56V7.648a.645.645 0 0 1 .967-.56z' }],
			['path', { d: 'M7 21h10' }],
			['rect', { width: '20', height: '14', x: '2', y: '3', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
