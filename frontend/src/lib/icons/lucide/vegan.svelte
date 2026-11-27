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
		name: 'vegan',
		size: 24,
		node: [
			['path', { d: 'M16 8q6 0 6-6-6 0-6 6' }],
			['path', { d: 'M17.41 3.59a10 10 0 1 0 3 3' }],
			['path', { d: 'M2 2a26.6 26.6 0 0 1 10 20c.9-6.82 1.5-9.5 4-14' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
