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
		name: 'waves-horizontal',
		size: 24,
		node: [
			['path', { d: 'M2 12q2.5 2 5 0t5 0 5 0 5 0' }],
			['path', { d: 'M2 19q2.5 2 5 0t5 0 5 0 5 0' }],
			['path', { d: 'M2 5q2.5 2 5 0t5 0 5 0 5 0' }]
		],
		aliases: ['waves']
	};
</script>

<Icon {...props} icon={iconData} />
