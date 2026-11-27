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
		name: 'summary',
		size: 24,
		node: [
			['path', { d: 'M15 4H7' }],
			['path', { d: 'm18 16 3 3-3 3' }],
			['path', { d: 'M3 4v13a2 2 0 0 0 2 2h16' }],
			['path', { d: 'M7 14h7' }],
			['path', { d: 'M7 9h12' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
