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
		name: 'dome',
		size: 24,
		node: [
			['path', { d: 'M10 21v-3a2 2 0 014 0v3' }],
			['path', { d: 'M12 2v2' }],
			['path', { d: 'M18 12v9' }],
			['path', { d: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2v-6a1 1 0 011-1h18a1 1 0 011 1z' }],
			['path', { d: 'M4 12a8 8 0 0116 0' }],
			['path', { d: 'M6 12v9' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
