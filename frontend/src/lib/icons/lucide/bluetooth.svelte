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
		name: 'bluetooth',
		size: 24,
		node: [
			['path', { d: 'm7 7 10 10-5 5V2l5 5L7 17' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
