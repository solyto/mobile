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
		name: 'rotate-cw-square',
		size: 24,
		node: [
			['path', { d: 'M12 5H6a2 2 0 0 0-2 2v3' }],
			['path', { d: 'm9 8 3-3-3-3' }],
			['path', { d: 'M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
