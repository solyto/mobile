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
		name: 'play-off',
		size: 24,
		node: [
			['path', { d: 'm10.215 4.56 9.79 5.71a2 2 0 0 1 .003 3.458l-.393.23' }],
			['path', { d: 'm16.042 16.042-8.034 4.686A2 2 0 0 1 5 19V5' }],
			['path', { d: 'm2 2 20 20' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
