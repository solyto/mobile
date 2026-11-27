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
		name: 'globe-x',
		size: 24,
		node: [
			['path', { d: 'm16 3 5 5' }],
			['path', { d: 'M2 12h20A10 10 0 1 1 12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 4-10' }],
			['path', { d: 'm21 3-5 5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
