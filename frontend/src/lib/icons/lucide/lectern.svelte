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
		name: 'lectern',
		size: 24,
		node: [
			['path', { d: 'M15 13h4a2 2 0 001.901-1.38l1.057-4.333A1 1 0 0021 6H3a1 1 0 00-.958 1.287L3.1 11.621A2 2 0 005.001 13h4' }],
			['path', { d: 'M15 22V11a1 1 0 00-1-1h-4a1 1 0 00-1 1v11' }],
			['path', { d: 'M18 22H6' }],
			['path', { d: 'M18 6V3a1 1 0 00-1-1h-3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
