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
		name: 'utility-pole',
		size: 24,
		node: [
			['path', { d: 'M12 2v20' }],
			['path', { d: 'M2 5h20' }],
			['path', { d: 'M3 3v2' }],
			['path', { d: 'M7 3v2' }],
			['path', { d: 'M17 3v2' }],
			['path', { d: 'M21 3v2' }],
			['path', { d: 'm19 5-7 7-7-7' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
