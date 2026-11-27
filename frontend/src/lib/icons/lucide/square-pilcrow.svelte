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
		name: 'square-pilcrow',
		size: 24,
		node: [
			['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
			['path', { d: 'M12 12H9.5a2.5 2.5 0 0 1 0-5H17' }],
			['path', { d: 'M12 7v10' }],
			['path', { d: 'M16 7v10' }]
		],
		aliases: ['pilcrow-square']
	};
</script>

<Icon {...props} icon={iconData} />
