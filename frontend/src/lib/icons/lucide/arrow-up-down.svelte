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
		name: 'arrow-up-down',
		size: 24,
		node: [
			['path', { d: 'm21 16-4 4-4-4' }],
			['path', { d: 'M17 20V4' }],
			['path', { d: 'm3 8 4-4 4 4' }],
			['path', { d: 'M7 4v16' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
