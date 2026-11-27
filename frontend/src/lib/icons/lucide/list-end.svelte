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
		name: 'list-end',
		size: 24,
		node: [
			['path', { d: 'M16 5H3' }],
			['path', { d: 'M16 12H3' }],
			['path', { d: 'M9 19H3' }],
			['path', { d: 'm16 16-3 3 3 3' }],
			['path', { d: 'M21 5v12a2 2 0 0 1-2 2h-6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
