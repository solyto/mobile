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
		name: 'heading-3',
		size: 24,
		node: [
			['path', { d: 'M4 12h8' }],
			['path', { d: 'M4 18V6' }],
			['path', { d: 'M12 18V6' }],
			['path', { d: 'M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2' }],
			['path', { d: 'M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
