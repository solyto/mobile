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
		name: 'list-check',
		size: 24,
		node: [
			['path', { d: 'M16 5H3' }],
			['path', { d: 'M16 12H3' }],
			['path', { d: 'M11 19H3' }],
			['path', { d: 'm15 18 2 2 4-4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
