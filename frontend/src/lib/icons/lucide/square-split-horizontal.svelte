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
		name: 'square-split-horizontal',
		size: 24,
		node: [
			['path', { d: 'M12 2v20' }],
			['path', { d: 'M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3' }],
			['path', { d: 'M8 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3' }]
		],
		aliases: ['split-square-horizontal']
	};
</script>

<Icon {...props} icon={iconData} />
