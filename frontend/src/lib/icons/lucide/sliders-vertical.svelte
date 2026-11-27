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
		name: 'sliders-vertical',
		size: 24,
		node: [
			['path', { d: 'M10 8h4' }],
			['path', { d: 'M12 21v-9' }],
			['path', { d: 'M12 8V3' }],
			['path', { d: 'M17 16h4' }],
			['path', { d: 'M19 12V3' }],
			['path', { d: 'M19 21v-5' }],
			['path', { d: 'M3 14h4' }],
			['path', { d: 'M5 10V3' }],
			['path', { d: 'M5 21v-7' }]
		],
		aliases: ['sliders']
	};
</script>

<Icon {...props} icon={iconData} />
