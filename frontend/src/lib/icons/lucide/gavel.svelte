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
		name: 'gavel',
		size: 24,
		node: [
			['path', { d: 'm14 13-8.381 8.38a1 1 0 0 1-3.001-3l8.384-8.381' }],
			['path', { d: 'm16 16 6-6' }],
			['path', { d: 'm21.5 10.5-8-8' }],
			['path', { d: 'm8 8 6-6' }],
			['path', { d: 'm8.5 7.5 8 8' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
