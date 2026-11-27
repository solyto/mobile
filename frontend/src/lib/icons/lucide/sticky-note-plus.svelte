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
		name: 'sticky-note-plus',
		size: 24,
		node: [
			['path', { d: 'M15 3v5a1 1 0 0 0 1 1h5' }],
			['path', { d: 'M18 15v6' }],
			['path', { d: 'M21 12.356V9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7.355' }],
			['path', { d: 'M21 18h-6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
