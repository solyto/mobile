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
		name: 'flask-conical-off',
		size: 24,
		node: [
			['path', { d: 'M10 2v2.343' }],
			['path', { d: 'M14 2v6.343' }],
			['path', { d: 'm2 2 20 20' }],
			['path', { d: 'M20 20a2 2 0 0 1-2 2H6a2 2 0 0 1-1.755-2.96l5.227-9.563' }],
			['path', { d: 'M6.453 15H15' }],
			['path', { d: 'M8.5 2h7' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
