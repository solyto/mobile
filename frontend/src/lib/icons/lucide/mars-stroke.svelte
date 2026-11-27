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
		name: 'mars-stroke',
		size: 24,
		node: [
			['path', { d: 'm14 6 4 4' }],
			['path', { d: 'M17 3h4v4' }],
			['path', { d: 'm21 3-7.75 7.75' }],
			['circle', { cx: '9', cy: '15', r: '6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
