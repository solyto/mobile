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
		name: 'webcam-off',
		size: 24,
		node: [
			['path', { d: 'M12 22v-4' }],
			['path', { d: 'M12.754 7.096a3 3 0 0 1 2.15 2.15' }],
			['path', { d: 'M12.863 12.873a3 3 0 0 1-3.736-3.735' }],
			['path', { d: 'M16.566 16.57A8 8 0 0 1 5.43 5.433' }],
			['path', { d: 'm2 2 20 20' }],
			['path', { d: 'M7 22h10' }],
			['path', { d: 'M8.478 2.817a8 8 0 0 1 10.705 10.705' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
