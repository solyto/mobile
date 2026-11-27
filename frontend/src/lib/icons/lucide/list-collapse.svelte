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
		name: 'list-collapse',
		size: 24,
		node: [
			['path', { d: 'M10 5h11' }],
			['path', { d: 'M10 12h11' }],
			['path', { d: 'M10 19h11' }],
			['path', { d: 'm3 10 3-3-3-3' }],
			['path', { d: 'm3 20 3-3-3-3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
