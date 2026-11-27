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
		name: 'cloud-sync',
		size: 24,
		node: [
			['path', { d: 'm17 18-1.535 1.605a5 5 0 0 1-8-1.5' }],
			['path', { d: 'M17 22v-4h-4' }],
			['path', { d: 'M20.996 15.251A4.5 4.5 0 0 0 17.495 8h-1.79a7 7 0 1 0-12.709 5.607' }],
			['path', { d: 'M7 10v4h4' }],
			['path', { d: 'm7 14 1.535-1.605a5 5 0 0 1 8 1.5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
