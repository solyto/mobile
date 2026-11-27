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
		name: 'square-parking-off',
		size: 24,
		node: [
			['path', { d: 'M3.6 3.6A2 2 0 0 1 5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-.59 1.41' }],
			['path', { d: 'M3 8.7V19a2 2 0 0 0 2 2h10.3' }],
			['path', { d: 'm2 2 20 20' }],
			['path', { d: 'M13 13a3 3 0 1 0 0-6H9v2' }],
			['path', { d: 'M9 17v-2.3' }]
		],
		aliases: ['parking-square-off']
	};
</script>

<Icon {...props} icon={iconData} />
