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
		name: 'heading-2',
		size: 24,
		node: [
			['path', { d: 'M4 12h8' }],
			['path', { d: 'M4 18V6' }],
			['path', { d: 'M12 18V6' }],
			['path', { d: 'M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
