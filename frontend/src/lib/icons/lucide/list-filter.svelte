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
		name: 'list-filter',
		size: 24,
		node: [
			['path', { d: 'M2 5h20' }],
			['path', { d: 'M6 12h12' }],
			['path', { d: 'M9 19h6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
