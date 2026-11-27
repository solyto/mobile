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
		name: 'briefcase',
		size: 24,
		node: [
			['path', { d: 'M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' }],
			['rect', { width: '20', height: '14', x: '2', y: '6', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
