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
		name: 'message-square-off',
		size: 24,
		node: [
			['path', { d: 'M19 19H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.7.7 0 0 1 2 21.286V5a2 2 0 0 1 1.184-1.826' }],
			['path', { d: 'm2 2 20 20' }],
			['path', { d: 'M8.656 3H20a2 2 0 0 1 2 2v11.344' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
