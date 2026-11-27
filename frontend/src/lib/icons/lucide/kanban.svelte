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
		name: 'kanban',
		size: 24,
		node: [
			['path', { d: 'M5 3v14' }],
			['path', { d: 'M12 3v8' }],
			['path', { d: 'M19 3v18' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
