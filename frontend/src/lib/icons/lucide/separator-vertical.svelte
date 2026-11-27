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
		name: 'separator-vertical',
		size: 24,
		node: [
			['path', { d: 'M12 3v18' }],
			['path', { d: 'm16 16 4-4-4-4' }],
			['path', { d: 'm8 8-4 4 4 4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
