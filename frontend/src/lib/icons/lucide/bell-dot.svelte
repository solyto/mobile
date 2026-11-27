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
		name: 'bell-dot',
		size: 24,
		node: [
			['path', { d: 'M10.268 21a2 2 0 0 0 3.464 0' }],
			['path', { d: 'M11.68 2.009A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673c-.824-.85-1.678-1.731-2.21-3.348' }],
			['circle', { cx: '18', cy: '5', r: '3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
