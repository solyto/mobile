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
		name: 'tower-control',
		size: 24,
		node: [
			['path', { d: 'M18.2 12.27 20 6H4l1.8 6.27a1 1 0 0 0 .95.73h10.5a1 1 0 0 0 .96-.73Z' }],
			['path', { d: 'M8 13v9' }],
			['path', { d: 'M16 22v-9' }],
			['path', { d: 'm9 6 1 7' }],
			['path', { d: 'm15 6-1 7' }],
			['path', { d: 'M12 6V2' }],
			['path', { d: 'M13 2h-2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
