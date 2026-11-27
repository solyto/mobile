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
		name: 'list-minus',
		size: 24,
		node: [
			['path', { d: 'M16 5H3' }],
			['path', { d: 'M11 12H3' }],
			['path', { d: 'M16 19H3' }],
			['path', { d: 'M21 12h-6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
