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
		name: 'scaling',
		size: 24,
		node: [
			['path', { d: 'M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }],
			['path', { d: 'M14 15H9v-5' }],
			['path', { d: 'M16 3h5v5' }],
			['path', { d: 'M21 3 9 15' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
