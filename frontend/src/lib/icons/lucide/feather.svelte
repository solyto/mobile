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
		name: 'feather',
		size: 24,
		node: [
			['path', { d: 'M14.086 18.412A2 2 0 0112.67 19H5v-7.672a2 2 0 01.586-1.414L11.75 3.75a6 6 0 118.49 8.49z' }],
			['path', { d: 'M16 8 2 22' }],
			['path', { d: 'M17.488 15H9' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
