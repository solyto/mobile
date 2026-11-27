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
		name: 'rotate-3d',
		size: 24,
		node: [
			['path', { d: 'm15.194 13.707 3.814 1.86-1.86 3.814' }],
			['path', { d: 'M16.47214 7.52786 A 5 10 0 1 0 13 21.79796' }],
			['path', { d: 'M21.79796 11 A 10 5 0 1 0 19 15.57071' }]
		],
		aliases: ['rotate-3-d']
	};
</script>

<Icon {...props} icon={iconData} />
