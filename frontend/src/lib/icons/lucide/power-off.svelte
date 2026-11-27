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
		name: 'power-off',
		size: 24,
		node: [
			['path', { d: 'M18.36 6.64A9 9 0 0 1 20.77 15' }],
			['path', { d: 'M6.16 6.16a9 9 0 1 0 12.68 12.68' }],
			['path', { d: 'M12 2v4' }],
			['path', { d: 'm2 2 20 20' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
