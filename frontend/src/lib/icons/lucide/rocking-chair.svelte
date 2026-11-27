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
		name: 'rocking-chair',
		size: 24,
		node: [
			['path', { d: 'm15 13 3.708 7.416' }],
			['path', { d: 'M3 19a15 15 0 0 0 18 0' }],
			['path', { d: 'm3 2 3.21 9.633A2 2 0 0 0 8.109 13H18' }],
			['path', { d: 'm9 13-3.708 7.416' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
