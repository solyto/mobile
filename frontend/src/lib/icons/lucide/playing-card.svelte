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
		name: 'playing-card',
		size: 24,
		node: [
			['path', { d: 'M12.832 8.445a1 1 0 00-1.589-.098l-2.075 3.098a1 1 0 000 1.11l2 3a1 1 0 001.664 0l2-3a1 1 0 000-1.11z' }],
			['rect', { x: '5', y: '2', width: '14', height: '20', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
