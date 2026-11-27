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
		name: 'minus',
		size: 24,
		node: [
			['path', { d: 'M5 12h14' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
