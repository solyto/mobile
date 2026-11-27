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
		name: 'clock-arrow-right',
		size: 24,
		node: [
			['path', { d: 'M12 6v6l2 1' }],
			['path', { d: 'M13.5 21.885A10 10 0 1 1 22 12' }],
			['path', { d: 'M14 18h8' }],
			['path', { d: 'm18 22 4-4-4-4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
