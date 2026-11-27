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
		name: 'folder-clock',
		size: 24,
		node: [
			['path', { d: 'M16 14v2.2l1.6 1' }],
			['path', { d: 'M7 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2' }],
			['circle', { cx: '16', cy: '16', r: '6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
