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
		name: 'drum',
		size: 24,
		node: [
			['path', { d: 'm2 2 8 8' }],
			['path', { d: 'm22 2-8 8' }],
			['ellipse', { cx: '12', cy: '9', rx: '10', ry: '5' }],
			['path', { d: 'M7 13.4v7.9' }],
			['path', { d: 'M12 14v8' }],
			['path', { d: 'M17 13.4v7.9' }],
			['path', { d: 'M2 9v8a10 5 0 0 0 20 0V9' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
