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
		name: 'ship-wheel',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '12', r: '8' }],
			['path', { d: 'M12 2v7.5' }],
			['path', { d: 'm19 5-5.23 5.23' }],
			['path', { d: 'M22 12h-7.5' }],
			['path', { d: 'm19 19-5.23-5.23' }],
			['path', { d: 'M12 14.5V22' }],
			['path', { d: 'M10.23 13.77 5 19' }],
			['path', { d: 'M9.5 12H2' }],
			['path', { d: 'M10.23 10.23 5 5' }],
			['circle', { cx: '12', cy: '12', r: '2.5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
