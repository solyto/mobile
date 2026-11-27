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
		name: 'circle-arrow-out-up-left',
		size: 24,
		node: [
			['path', { d: 'M2 8V2h6' }],
			['path', { d: 'm2 2 10 10' }],
			['path', { d: 'M12 2A10 10 0 1 1 2 12' }]
		],
		aliases: ['arrow-up-left-from-circle']
	};
</script>

<Icon {...props} icon={iconData} />
