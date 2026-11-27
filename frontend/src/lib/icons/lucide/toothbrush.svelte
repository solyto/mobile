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
		name: 'toothbrush',
		size: 24,
		node: [
			['path', { d: 'M15 11c-2 2-4 2-6 4l-7 7' }],
			['path', { d: 'm22 4-7.414 7.414-2-2A2 2 0 0114 6c0-.512.196-1.024.586-1.414A2 2 0 0116 4a2 2 0 013.262-1.552l2.152 2.138' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
