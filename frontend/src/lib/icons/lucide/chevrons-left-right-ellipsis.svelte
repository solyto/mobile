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
		name: 'chevrons-left-right-ellipsis',
		size: 24,
		node: [
			['path', { d: 'M12 12h.01' }],
			['path', { d: 'M16 12h.01' }],
			['path', { d: 'm17 7 5 5-5 5' }],
			['path', { d: 'm7 7-5 5 5 5' }],
			['path', { d: 'M8 12h.01' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
