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
		name: 'broom',
		size: 24,
		node: [
			['path', { d: 'M13.5 10.5 22 2' }],
			['path', { d: 'M14.734 13.841a2 2 0 00-.314-2.42L12.58 9.58a2 2 0 00-2.421-.314l-7.657 4.461A1 1 0 002.3 15.3l6.403 6.403a1 1 0 001.571-.204z' }],
			['path', { d: 'm5 18 2-2' }],
			['path', { d: 'm7.699 10.7 5.602 5.601' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
