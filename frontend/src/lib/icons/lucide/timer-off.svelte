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
		name: 'timer-off',
		size: 24,
		node: [
			['path', { d: 'M10 2h4' }],
			['path', { d: 'M4.6 11a8 8 0 0 0 1.7 8.7 8 8 0 0 0 8.7 1.7' }],
			['path', { d: 'M7.4 7.4a8 8 0 0 1 10.3 1 8 8 0 0 1 .9 10.2' }],
			['path', { d: 'm2 2 20 20' }],
			['path', { d: 'M12 12v-2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
