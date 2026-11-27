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
		name: 'remove-formatting',
		size: 24,
		node: [
			['path', { d: 'M4 7V4h16v3' }],
			['path', { d: 'M5 20h6' }],
			['path', { d: 'M13 4 8 20' }],
			['path', { d: 'm15 15 5 5' }],
			['path', { d: 'm20 15-5 5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
