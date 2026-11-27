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
		name: 'text-align-end',
		size: 24,
		node: [
			['path', { d: 'M21 5H3' }],
			['path', { d: 'M21 12H9' }],
			['path', { d: 'M21 19H7' }]
		],
		aliases: ['align-right']
	};
</script>

<Icon {...props} icon={iconData} />
