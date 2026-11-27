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
		name: 'x-line-top',
		size: 24,
		node: [
			['path', { d: 'M18 4H6' }],
			['path', { d: 'M18 8 6 20' }],
			['path', { d: 'm6 8 12 12' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
