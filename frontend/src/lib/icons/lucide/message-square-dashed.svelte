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
		name: 'message-square-dashed',
		size: 24,
		node: [
			['path', { d: 'M14 3h2' }],
			['path', { d: 'M16 19h-2' }],
			['path', { d: 'M2 12v-2' }],
			['path', { d: 'M2 16v5.286a.71.71 0 0 0 1.212.502l1.149-1.149' }],
			['path', { d: 'M20 19a2 2 0 0 0 2-2v-1' }],
			['path', { d: 'M22 10v2' }],
			['path', { d: 'M22 6V5a2 2 0 0 0-2-2' }],
			['path', { d: 'M4 3a2 2 0 0 0-2 2v1' }],
			['path', { d: 'M8 19h2' }],
			['path', { d: 'M8 3h2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
