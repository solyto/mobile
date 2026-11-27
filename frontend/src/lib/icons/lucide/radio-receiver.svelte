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
		name: 'radio-receiver',
		size: 24,
		node: [
			['path', { d: 'M5 16v2' }],
			['path', { d: 'M19 16v2' }],
			['rect', { width: '20', height: '8', x: '2', y: '8', rx: '2' }],
			['path', { d: 'M18 12h.01' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
