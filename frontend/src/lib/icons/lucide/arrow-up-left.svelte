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
		name: 'arrow-up-left',
		size: 24,
		node: [
			['path', { d: 'M7 17V7h10' }],
			['path', { d: 'M17 17 7 7' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
