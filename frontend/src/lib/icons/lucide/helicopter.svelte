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
		name: 'helicopter',
		size: 24,
		node: [
			['path', { d: 'M11 17v4' }],
			['path', { d: 'M14 3v8a2 2 0 0 0 2 2h5.865' }],
			['path', { d: 'M17 17v4' }],
			['path', { d: 'M18 17a4 4 0 0 0 4-4 8 6 0 0 0-8-6 6 5 0 0 0-6 5v3a2 2 0 0 0 2 2z' }],
			['path', { d: 'M2 10v5' }],
			['path', { d: 'M6 3h16' }],
			['path', { d: 'M7 21h14' }],
			['path', { d: 'M8 13H2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
