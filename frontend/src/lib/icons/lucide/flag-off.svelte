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
		name: 'flag-off',
		size: 24,
		node: [
			['path', { d: 'M16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528' }],
			['path', { d: 'm2 2 20 20' }],
			['path', { d: 'M4 22V4' }],
			['path', { d: 'M7.656 2H8c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10.347' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
