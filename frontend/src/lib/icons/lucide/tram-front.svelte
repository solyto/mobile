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
		name: 'tram-front',
		size: 24,
		node: [
			['rect', { width: '16', height: '16', x: '4', y: '3', rx: '2' }],
			['path', { d: 'M4 11h16' }],
			['path', { d: 'M12 3v8' }],
			['path', { d: 'm8 19-2 3' }],
			['path', { d: 'm18 22-2-3' }],
			['path', { d: 'M8 15h.01' }],
			['path', { d: 'M16 15h.01' }]
		],
		aliases: ['train']
	};
</script>

<Icon {...props} icon={iconData} />
