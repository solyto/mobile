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
		name: 'log-in',
		size: 24,
		node: [
			['path', { d: 'm10 17 5-5-5-5' }],
			['path', { d: 'M15 12H3' }],
			['path', { d: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
