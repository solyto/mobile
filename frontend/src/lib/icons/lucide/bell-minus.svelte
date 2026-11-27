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
		name: 'bell-minus',
		size: 24,
		node: [
			['path', { d: 'M10.268 21a2 2 0 0 0 3.464 0' }],
			['path', { d: 'M15 8h6' }],
			['path', { d: 'M16.243 3.757A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673A9.4 9.4 0 0 1 18.667 12' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
