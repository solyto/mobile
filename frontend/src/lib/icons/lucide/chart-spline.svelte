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
		name: 'chart-spline',
		size: 24,
		node: [
			['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
			['path', { d: 'M7 16c.5-2 1.5-7 4-7 2 0 2 3 4 3 2.5 0 4.5-5 5-7' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
