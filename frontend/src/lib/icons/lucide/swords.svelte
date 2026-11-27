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
		name: 'swords',
		size: 24,
		node: [
			['path', { d: 'm13 19 6-6' }],
			['path', { d: 'M14.5 17.5 3.586 6.586A2 2 0 013 5.172V3h2.172a2 2 0 011.414.586L17.5 14.5' }],
			['path', { d: 'm14.828 6.172 2.586-2.586A2 2 0 0118.828 3H21v2.172a2 2 0 01-.586 1.414l-2.586 2.586' }],
			['path', { d: 'm16 16 4 4' }],
			['path', { d: 'm19 21 2-2' }],
			['path', { d: 'm5 14 4 4' }],
			['path', { d: 'm5 21-2-2' }],
			['path', { d: 'M7.5 16.5 4 20' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
