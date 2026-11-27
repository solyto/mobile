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
		name: 'parentheses',
		size: 24,
		node: [
			['path', { d: 'M8 21s-4-3-4-9 4-9 4-9' }],
			['path', { d: 'M16 3s4 3 4 9-4 9-4 9' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
