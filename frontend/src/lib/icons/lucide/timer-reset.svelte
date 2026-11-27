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
		name: 'timer-reset',
		size: 24,
		node: [
			['path', { d: 'M10 2h4' }],
			['path', { d: 'M12 14v-4' }],
			['path', { d: 'M4 13a8 8 0 0 1 8-7 8 8 0 1 1-5.3 14L4 17.6' }],
			['path', { d: 'M9 17H4v5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
