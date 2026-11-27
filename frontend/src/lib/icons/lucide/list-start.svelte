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
		name: 'list-start',
		size: 24,
		node: [
			['path', { d: 'M3 5h6' }],
			['path', { d: 'M3 12h13' }],
			['path', { d: 'M3 19h13' }],
			['path', { d: 'm16 8-3-3 3-3' }],
			['path', { d: 'M21 19V7a2 2 0 0 0-2-2h-6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
