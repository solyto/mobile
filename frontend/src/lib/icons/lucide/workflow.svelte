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
		name: 'workflow',
		size: 24,
		node: [
			['rect', { width: '8', height: '8', x: '3', y: '3', rx: '2' }],
			['path', { d: 'M7 11v4a2 2 0 0 0 2 2h4' }],
			['rect', { width: '8', height: '8', x: '13', y: '13', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
