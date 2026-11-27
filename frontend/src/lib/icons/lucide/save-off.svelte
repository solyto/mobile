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
		name: 'save-off',
		size: 24,
		node: [
			['path', { d: 'M13 13H8a1 1 0 0 0-1 1v7' }],
			['path', { d: 'M14 8h1' }],
			['path', { d: 'M17 21v-4' }],
			['path', { d: 'm2 2 20 20' }],
			['path', { d: 'M20.41 20.41A2 2 0 0 1 19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 .59-1.41' }],
			['path', { d: 'M9 3h6.2a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V15' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
