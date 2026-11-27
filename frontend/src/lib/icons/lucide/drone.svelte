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
		name: 'drone',
		size: 24,
		node: [
			['path', { d: 'M10 10 7 7' }],
			['path', { d: 'm10 14-3 3' }],
			['path', { d: 'm14 10 3-3' }],
			['path', { d: 'm14 14 3 3' }],
			['path', { d: 'M14.205 4.139a4 4 0 1 1 5.439 5.863' }],
			['path', { d: 'M19.637 14a4 4 0 1 1-5.432 5.868' }],
			['path', { d: 'M4.367 10a4 4 0 1 1 5.438-5.862' }],
			['path', { d: 'M9.795 19.862a4 4 0 1 1-5.429-5.873' }],
			['rect', { x: '10', y: '8', width: '4', height: '8', rx: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
