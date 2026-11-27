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
		name: 'baby',
		size: 24,
		node: [
			['path', { d: 'M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5' }],
			['path', { d: 'M15 12h.01' }],
			['path', { d: 'M19.38 6.813A9 9 0 0 1 20.8 10.2a2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1' }],
			['path', { d: 'M9 12h.01' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
