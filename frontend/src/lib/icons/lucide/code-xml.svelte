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
		name: 'code-xml',
		size: 24,
		node: [
			['path', { d: 'm18 16 4-4-4-4' }],
			['path', { d: 'm6 8-4 4 4 4' }],
			['path', { d: 'm14.5 4-5 16' }]
		],
		aliases: ['code-2']
	};
</script>

<Icon {...props} icon={iconData} />
