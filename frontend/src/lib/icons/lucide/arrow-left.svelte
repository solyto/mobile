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
		name: 'arrow-left',
		size: 24,
		node: [
			['path', { d: 'm12 19-7-7 7-7' }],
			['path', { d: 'M19 12H5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
