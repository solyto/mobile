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
		name: 'loader-circle',
		size: 24,
		node: [
			['path', { d: 'M21 12a9 9 0 1 1-6.219-8.56' }]
		],
		aliases: ['loader-2']
	};
</script>

<Icon {...props} icon={iconData} />
