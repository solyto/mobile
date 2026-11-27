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
		name: 'turkish-lira',
		size: 24,
		node: [
			['path', { d: 'M15 4 5 9' }],
			['path', { d: 'm15 8.5-10 5' }],
			['path', { d: 'M18 12a9 9 0 0 1-9 9V3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
