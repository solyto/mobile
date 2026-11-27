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
		name: 'door-stairwell',
		size: 24,
		node: [
			['path', { d: 'M12 17v-3a1 1 0 011-1h6' }],
			['path', { d: 'M19 17h-9a1 1 0 00-1 1v3' }],
			['path', { d: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16' }],
			['path', { d: 'M19 9h-3a1 1 0 00-1 1v3' }],
			['path', { d: 'M22 21H2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
