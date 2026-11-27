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
		name: 'save-pen',
		size: 24,
		node: [
			['path', { d: 'M13.33 13H8a1 1 0 00-1 1v7' }],
			['path', { d: 'M14.363 17.634a2 2 0 00-.506.854l-.837 2.87a.5.5 0 00.62.62l2.87-.837a2 2 0 00.854-.506l4.013-4.009a1 1 0 10-3.004-3.004z' }],
			['path', { d: 'M7 3v4a1 1 0 001 1h7' }],
			['path', { d: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h10.2a2 2 0 011.4.6l3.8 3.8a2 2 0 01.6 1.4v.3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
