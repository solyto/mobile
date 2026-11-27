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
		name: 'brick-wall-fire',
		size: 24,
		node: [
			['path', { d: 'M16 3v2.107' }],
			['path', { d: 'M17 9c1 3 2.5 3.5 3.5 4.5A5 5 0 0 1 22 17a5 5 0 0 1-10 0c0-.3 0-.6.1-.9a2 2 0 1 0 3.3-2C13 11.5 16 9 17 9' }],
			['path', { d: 'M21 8.274V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.938' }],
			['path', { d: 'M3 15h5.253' }],
			['path', { d: 'M3 9h8.228' }],
			['path', { d: 'M8 15v6' }],
			['path', { d: 'M8 3v6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
