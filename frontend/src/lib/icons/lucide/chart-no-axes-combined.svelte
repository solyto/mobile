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
		name: 'chart-no-axes-combined',
		size: 24,
		node: [
			['path', { d: 'M12 16v5' }],
			['path', { d: 'M16 14.639V21' }],
			['path', { d: 'M20 10.656V21' }],
			['path', { d: 'm22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15' }],
			['path', { d: 'M4 18.463V21' }],
			['path', { d: 'M8 14.656V21' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
