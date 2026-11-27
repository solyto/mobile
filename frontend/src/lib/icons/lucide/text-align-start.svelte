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
		name: 'text-align-start',
		size: 24,
		node: [
			['path', { d: 'M21 5H3' }],
			['path', { d: 'M15 12H3' }],
			['path', { d: 'M17 19H3' }]
		],
		aliases: ['text', 'align-left']
	};
</script>

<Icon {...props} icon={iconData} />
