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
		name: 'calendar-off',
		size: 24,
		node: [
			['path', { d: 'M16 2v3' }],
			['path', { d: 'm2 2 20 20' }],
			['path', { d: 'M21 9h-5.5' }],
			['path', { d: 'M3 9h6' }],
			['path', { d: 'M3.586 3.586A2 2 0 003 5v14a2 2 0 002 2h14a2 2 0 001.414-.586' }],
			['path', { d: 'M8.656 3H19a2 2 0 012 2v10.344' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
