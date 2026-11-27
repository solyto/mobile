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
		name: 'venus-and-mars',
		size: 24,
		node: [
			['path', { d: 'M10 20h4' }],
			['path', { d: 'M12 16v6' }],
			['path', { d: 'M17 2h4v4' }],
			['path', { d: 'm21 2-5.46 5.46' }],
			['circle', { cx: '12', cy: '11', r: '5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
