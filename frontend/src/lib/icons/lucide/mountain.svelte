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
		name: 'mountain',
		size: 24,
		node: [
			['path', { d: 'm8 3 4 8 5-5 5 15H2L8 3z' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
