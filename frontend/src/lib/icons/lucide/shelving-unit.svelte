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
		name: 'shelving-unit',
		size: 24,
		node: [
			['path', { d: 'M12 12V9a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3' }],
			['path', { d: 'M16 20v-3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3' }],
			['path', { d: 'M20 22V2' }],
			['path', { d: 'M4 12h16' }],
			['path', { d: 'M4 20h16' }],
			['path', { d: 'M4 2v20' }],
			['path', { d: 'M4 4h16' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
