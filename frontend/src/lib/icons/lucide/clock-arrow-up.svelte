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
		name: 'clock-arrow-up',
		size: 24,
		node: [
			['path', { d: 'M12 6v6l1.56.78' }],
			['path', { d: 'M13.227 21.925a10 10 0 1 1 8.767-9.588' }],
			['path', { d: 'm14 18 4-4 4 4' }],
			['path', { d: 'M18 22v-8' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
