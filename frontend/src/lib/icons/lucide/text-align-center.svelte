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
		name: 'text-align-center',
		size: 24,
		node: [
			['path', { d: 'M21 5H3' }],
			['path', { d: 'M17 12H7' }],
			['path', { d: 'M19 19H5' }]
		],
		aliases: ['align-center']
	};
</script>

<Icon {...props} icon={iconData} />
