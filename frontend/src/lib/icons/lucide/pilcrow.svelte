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
		name: 'pilcrow',
		size: 24,
		node: [
			['path', { d: 'M13 4v16' }],
			['path', { d: 'M17 4v16' }],
			['path', { d: 'M19 4H9.5a4.5 4.5 0 0 0 0 9H13' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
