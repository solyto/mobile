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
		name: 'trash',
		size: 24,
		node: [
			['path', { d: 'M10 11v6' }],
			['path', { d: 'M14 11v6' }],
			['path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' }],
			['path', { d: 'M3 6h18' }],
			['path', { d: 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }]
		],
		aliases: ['trash-2']
	};
</script>

<Icon {...props} icon={iconData} />
