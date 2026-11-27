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
		name: 'arrows-up-from-line',
		size: 24,
		node: [
			['path', { d: 'm4 6 3-3 3 3' }],
			['path', { d: 'M7 17V3' }],
			['path', { d: 'm14 6 3-3 3 3' }],
			['path', { d: 'M17 17V3' }],
			['path', { d: 'M4 21h16' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
