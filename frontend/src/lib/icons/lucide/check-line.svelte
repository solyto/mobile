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
		name: 'check-line',
		size: 24,
		node: [
			['path', { d: 'M20 4L9 15' }],
			['path', { d: 'M21 19L3 19' }],
			['path', { d: 'M9 15L4 10' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
