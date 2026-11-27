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
		name: 'circle-arrow-out-up-right',
		size: 24,
		node: [
			['path', { d: 'M22 12A10 10 0 1 1 12 2' }],
			['path', { d: 'M22 2 12 12' }],
			['path', { d: 'M16 2h6v6' }]
		],
		aliases: ['arrow-up-right-from-circle']
	};
</script>

<Icon {...props} icon={iconData} />
