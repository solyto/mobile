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
		name: 'import',
		size: 24,
		node: [
			['path', { d: 'M12 3v12' }],
			['path', { d: 'm8 11 4 4 4-4' }],
			['path', { d: 'M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
