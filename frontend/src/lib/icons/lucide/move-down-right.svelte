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
		name: 'move-down-right',
		size: 24,
		node: [
			['path', { d: 'M19 13V19H13' }],
			['path', { d: 'M5 5L19 19' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
