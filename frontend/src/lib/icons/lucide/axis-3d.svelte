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
		name: 'axis-3d',
		size: 24,
		node: [
			['path', { d: 'M13.5 10.5 15 9' }],
			['path', { d: 'M4 4v15a1 1 0 0 0 1 1h15' }],
			['path', { d: 'M4.293 19.707 6 18' }],
			['path', { d: 'm9 15 1.5-1.5' }]
		],
		aliases: ['axis-3-d']
	};
</script>

<Icon {...props} icon={iconData} />
