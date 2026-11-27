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
		name: 'rectangle-vertical',
		size: 24,
		node: [
			['rect', { width: '12', height: '20', x: '6', y: '2', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
