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
		name: 'rotate-ccw-square',
		size: 24,
		node: [
			['path', { d: 'M20 9V7a2 2 0 0 0-2-2h-6' }],
			['path', { d: 'm15 2-3 3 3 3' }],
			['path', { d: 'M20 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
