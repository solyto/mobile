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
		name: 'earth',
		size: 24,
		node: [
			['path', { d: 'M21.54 15H17a2 2 0 0 0-2 2v4.54' }],
			['path', { d: 'M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17' }],
			['path', { d: 'M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05' }],
			['circle', { cx: '12', cy: '12', r: '10' }]
		],
		aliases: ['globe-2']
	};
</script>

<Icon {...props} icon={iconData} />
