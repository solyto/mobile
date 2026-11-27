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
		name: 'swiss-franc',
		size: 24,
		node: [
			['path', { d: 'M10 21V3h8' }],
			['path', { d: 'M6 16h9' }],
			['path', { d: 'M10 9.5h7' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
