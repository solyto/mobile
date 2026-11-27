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
		name: 'arrow-left-to-line',
		size: 24,
		node: [
			['path', { d: 'M3 19V5' }],
			['path', { d: 'm13 6-6 6 6 6' }],
			['path', { d: 'M7 12h14' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
