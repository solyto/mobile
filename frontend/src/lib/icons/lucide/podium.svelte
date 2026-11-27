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
		name: 'podium',
		size: 24,
		node: [
			['path', { d: 'M12 6V2h-1' }],
			['path', { d: 'M9 15a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1' }],
			['path', { d: 'M9 21V11a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v10' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
