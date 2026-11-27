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
		name: 'boom-box',
		size: 24,
		node: [
			['path', { d: 'M4 9V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4' }],
			['path', { d: 'M8 8v1' }],
			['path', { d: 'M12 8v1' }],
			['path', { d: 'M16 8v1' }],
			['rect', { width: '20', height: '12', x: '2', y: '9', rx: '2' }],
			['circle', { cx: '8', cy: '15', r: '2' }],
			['circle', { cx: '16', cy: '15', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
