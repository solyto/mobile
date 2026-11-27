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
		name: 'piano',
		size: 24,
		node: [
			['path', { d: 'M10 13v4' }],
			['path', { d: 'M14 13v4' }],
			['path', { d: 'M18 13v4' }],
			['path', { d: 'M2 13h20' }],
			['path', { d: 'M22 11.5A3.5 3.5 0 0018.5 8a3.52 3.52 0 01-3.173-2A7 7 0 002 9v10a2 2 0 002 2h16a2 2 0 002-2z' }],
			['path', { d: 'M6 13v4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
