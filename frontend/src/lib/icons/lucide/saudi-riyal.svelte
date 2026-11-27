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
		name: 'saudi-riyal',
		size: 24,
		node: [
			['path', { d: 'm20 19.5-5.5 1.2' }],
			['path', { d: 'M14.5 4v11.22a1 1 0 0 0 1.242.97L20 15.2' }],
			['path', { d: 'm2.978 19.351 5.549-1.363A2 2 0 0 0 10 16V2' }],
			['path', { d: 'M20 10 4 13.5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
