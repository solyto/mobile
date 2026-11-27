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
		name: 'move-up-right',
		size: 24,
		node: [
			['path', { d: 'M13 5H19V11' }],
			['path', { d: 'M19 5L5 19' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
