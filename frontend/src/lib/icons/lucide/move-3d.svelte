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
		name: 'move-3d',
		size: 24,
		node: [
			['path', { d: 'M5 3v16h16' }],
			['path', { d: 'm5 19 6-6' }],
			['path', { d: 'm2 6 3-3 3 3' }],
			['path', { d: 'm18 16 3 3-3 3' }]
		],
		aliases: ['move-3-d']
	};
</script>

<Icon {...props} icon={iconData} />
