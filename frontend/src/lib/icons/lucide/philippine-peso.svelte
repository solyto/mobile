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
		name: 'philippine-peso',
		size: 24,
		node: [
			['path', { d: 'M20 11H4' }],
			['path', { d: 'M20 7H4' }],
			['path', { d: 'M7 21V4a1 1 0 0 1 1-1h4a1 1 0 0 1 0 12H7' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
