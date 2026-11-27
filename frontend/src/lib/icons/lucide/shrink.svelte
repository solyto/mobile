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
		name: 'shrink',
		size: 24,
		node: [
			['path', { d: 'm15 15 6 6m-6-6v4.8m0-4.8h4.8' }],
			['path', { d: 'M9 19.8V15m0 0H4.2M9 15l-6 6' }],
			['path', { d: 'M15 4.2V9m0 0h4.8M15 9l6-6' }],
			['path', { d: 'M9 4.2V9m0 0H4.2M9 9 3 3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
