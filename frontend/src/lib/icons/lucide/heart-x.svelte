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
		name: 'heart-x',
		size: 24,
		node: [
			['path', { d: 'm15.5 12.5 5 5' }],
			['path', { d: 'm20.5 12.5-5 5' }],
			['path', { d: 'M21.955 8.774a5.5 5.5 0 0 0-9.546-2.95.6.6 0 0 1-.818 0A5.5 5.5 0 0 0 2 9.5c0 2.3 1.5 4 3 5.5l5.508 5.332a2 2 0 0 0 2.57.352' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
