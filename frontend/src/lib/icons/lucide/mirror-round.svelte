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
		name: 'mirror-round',
		size: 24,
		node: [
			['path', { d: 'M10 6.6 8.6 8' }],
			['path', { d: 'M12 18v4' }],
			['path', { d: 'M15 7.5 9.5 13' }],
			['path', { d: 'M7 22h10' }],
			['circle', { cx: '12', cy: '10', r: '8' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
