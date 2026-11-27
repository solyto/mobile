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
		name: 'notepad-text',
		size: 24,
		node: [
			['path', { d: 'M8 2v4' }],
			['path', { d: 'M12 2v4' }],
			['path', { d: 'M16 2v4' }],
			['rect', { width: '16', height: '18', x: '4', y: '4', rx: '2' }],
			['path', { d: 'M8 10h6' }],
			['path', { d: 'M8 14h8' }],
			['path', { d: 'M8 18h5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
