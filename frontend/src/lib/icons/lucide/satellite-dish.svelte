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
		name: 'satellite-dish',
		size: 24,
		node: [
			['path', { d: 'M18 12a6 6 0 00-6-6' }],
			['path', { d: 'M2.824 10.459a8 8 0 0010.717 10.717c.558-.276.623-1.012.183-1.452l-9.448-9.448c-.44-.44-1.176-.375-1.452.183' }],
			['path', { d: 'M22 12A10 10 0 0012 2' }],
			['path', { d: 'm9 15 4-4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
