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
		name: 'hard-drive-download',
		size: 24,
		node: [
			['path', { d: 'M12 2v8' }],
			['path', { d: 'm16 6-4 4-4-4' }],
			['rect', { width: '20', height: '8', x: '2', y: '14', rx: '2' }],
			['path', { d: 'M6 18h.01' }],
			['path', { d: 'M10 18h.01' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
