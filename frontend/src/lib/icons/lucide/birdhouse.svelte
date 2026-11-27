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
		name: 'birdhouse',
		size: 24,
		node: [
			['path', { d: 'M12 18v4' }],
			['path', { d: 'm17 18 1.956-11.468' }],
			['path', { d: 'm3 8 7.82-5.615a2 2 0 0 1 2.36 0L21 8' }],
			['path', { d: 'M4 18h16' }],
			['path', { d: 'M7 18 5.044 6.532' }],
			['circle', { cx: '12', cy: '10', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
