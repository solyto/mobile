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
		name: 'log-out',
		size: 24,
		node: [
			['path', { d: 'm16 17 5-5-5-5' }],
			['path', { d: 'M21 12H9' }],
			['path', { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
