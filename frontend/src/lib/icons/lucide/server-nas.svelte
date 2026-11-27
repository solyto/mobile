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
		name: 'server-nas',
		size: 24,
		node: [
			['path', { d: 'M10 16V8' }],
			['path', { d: 'M14 16V8' }],
			['path', { d: 'M18 16V8' }],
			['path', { d: 'M6 12h.01' }],
			['path', { d: 'M6 16h.01' }],
			['rect', { x: '2', y: '4', width: '20', height: '16', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
