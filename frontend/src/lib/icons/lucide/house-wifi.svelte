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
		name: 'house-wifi',
		size: 24,
		node: [
			['path', { d: 'M9.5 13.866a4 4 0 0 1 5 .01' }],
			['path', { d: 'M12 17h.01' }],
			['path', { d: 'M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }],
			['path', { d: 'M7 10.754a8 8 0 0 1 10 0' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
