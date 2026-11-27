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
		name: 'test-tube-diagonal',
		size: 24,
		node: [
			['path', { d: 'M21 7 6.82 21.18a2.83 2.83 0 0 1-3.99-.01a2.83 2.83 0 0 1 0-4L17 3' }],
			['path', { d: 'm16 2 6 6' }],
			['path', { d: 'M12 16H4' }]
		],
		aliases: ['test-tube-2']
	};
</script>

<Icon {...props} icon={iconData} />
