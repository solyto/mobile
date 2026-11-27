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
		name: 'iteration-cw',
		size: 24,
		node: [
			['path', { d: 'M4 10a8 8 0 1 1 8 8H4' }],
			['path', { d: 'm8 22-4-4 4-4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
