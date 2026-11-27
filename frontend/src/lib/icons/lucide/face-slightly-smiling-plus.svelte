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
		name: 'face-slightly-smiling-plus',
		size: 24,
		node: [
			['path', { d: 'M13.267 2.08a10 10 0 108.653 8.653' }],
			['path', { d: 'M15 10V9' }],
			['path', { d: 'M16 5h6' }],
			['path', { d: 'M16.472 15a6 6 0 01-8.943 0' }],
			['path', { d: 'M19 2v6' }],
			['path', { d: 'M9 10V9' }]
		],
		aliases: ['smile-plus']
	};
</script>

<Icon {...props} icon={iconData} />
