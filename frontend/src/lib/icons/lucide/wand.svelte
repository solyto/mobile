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
		name: 'wand',
		size: 24,
		node: [
			['path', { d: 'M15 4V2' }],
			['path', { d: 'M15 16v-2' }],
			['path', { d: 'M8 9h2' }],
			['path', { d: 'M20 9h2' }],
			['path', { d: 'M17.8 11.8 19 13' }],
			['path', { d: 'M15 9h.01' }],
			['path', { d: 'M17.8 6.2 19 5' }],
			['path', { d: 'm3 21 9-9' }],
			['path', { d: 'M12.2 6.2 11 5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
