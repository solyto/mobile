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
		name: 'spell-check',
		size: 24,
		node: [
			['path', { d: 'm20 15-5.5 5.5L12 18' }],
			['path', { d: 'm4 16 6-12 5.115 10.23' }],
			['path', { d: 'M6 12h8' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
