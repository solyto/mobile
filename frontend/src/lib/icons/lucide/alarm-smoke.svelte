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
		name: 'alarm-smoke',
		size: 24,
		node: [
			['path', { d: 'M11 21c0-2.5 2-2.5 2-5' }],
			['path', { d: 'M16 21c0-2.5 2-2.5 2-5' }],
			['path', { d: 'm19 8-.8 3a1.25 1.25 0 0 1-1.2 1H7a1.25 1.25 0 0 1-1.2-1L5 8' }],
			['path', { d: 'M21 3a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a1 1 0 0 1 1-1z' }],
			['path', { d: 'M6 21c0-2.5 2-2.5 2-5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
