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
		name: 'list-tree',
		size: 24,
		node: [
			['path', { d: 'M8 5h13' }],
			['path', { d: 'M13 12h8' }],
			['path', { d: 'M13 19h8' }],
			['path', { d: 'M3 10a2 2 0 0 0 2 2h3' }],
			['path', { d: 'M3 5v12a2 2 0 0 0 2 2h3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
