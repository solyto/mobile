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
		name: 'clef-alto',
		size: 24,
		node: [
			['path', { d: 'M10 4v16' }],
			['path', { d: 'M14 4.764a3 3 0 1 1-.152 4.327A4 4 0 0 1 10 12a4 4 0 0 1 3.848 2.909A3 3 0 1 1 14 19.236' }],
			['path', { d: 'M6 4v16' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
