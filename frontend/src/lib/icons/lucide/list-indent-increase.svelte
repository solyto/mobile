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
		name: 'list-indent-increase',
		size: 24,
		node: [
			['path', { d: 'M21 5H11' }],
			['path', { d: 'M21 12H11' }],
			['path', { d: 'M21 19H11' }],
			['path', { d: 'm3 8 4 4-4 4' }]
		],
		aliases: ['indent', 'indent-increase']
	};
</script>

<Icon {...props} icon={iconData} />
