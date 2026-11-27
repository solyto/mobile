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
		name: 'antenna',
		size: 24,
		node: [
			['path', { d: 'M2 12 7 2' }],
			['path', { d: 'm7 12 5-10' }],
			['path', { d: 'm12 12 5-10' }],
			['path', { d: 'm17 12 5-10' }],
			['path', { d: 'M4.5 7h15' }],
			['path', { d: 'M12 16v6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
