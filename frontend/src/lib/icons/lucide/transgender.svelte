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
		name: 'transgender',
		size: 24,
		node: [
			['path', { d: 'M12 16v6' }],
			['path', { d: 'M14 20h-4' }],
			['path', { d: 'M18 2h4v4' }],
			['path', { d: 'm2 2 7.17 7.17' }],
			['path', { d: 'M2 5.355V2h3.357' }],
			['path', { d: 'm22 2-7.17 7.17' }],
			['path', { d: 'M8 5 5 8' }],
			['circle', { cx: '12', cy: '12', r: '4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
