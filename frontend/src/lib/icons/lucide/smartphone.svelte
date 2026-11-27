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
		name: 'smartphone',
		size: 24,
		node: [
			['rect', { width: '14', height: '20', x: '5', y: '2', rx: '2', ry: '2' }],
			['path', { d: 'M12 18h.01' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
