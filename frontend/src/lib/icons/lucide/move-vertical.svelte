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
		name: 'move-vertical',
		size: 24,
		node: [
			['path', { d: 'M12 2v20' }],
			['path', { d: 'm8 18 4 4 4-4' }],
			['path', { d: 'm8 6 4-4 4 4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
