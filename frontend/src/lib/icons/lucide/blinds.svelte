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
		name: 'blinds',
		size: 24,
		node: [
			['path', { d: 'M3 3h18' }],
			['path', { d: 'M20 7H8' }],
			['path', { d: 'M20 11H8' }],
			['path', { d: 'M10 19h10' }],
			['path', { d: 'M8 15h12' }],
			['path', { d: 'M4 3v14' }],
			['circle', { cx: '4', cy: '19', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
