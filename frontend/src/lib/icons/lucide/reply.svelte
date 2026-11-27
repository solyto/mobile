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
		name: 'reply',
		size: 24,
		node: [
			['path', { d: 'M20 18v-2a4 4 0 0 0-4-4H4' }],
			['path', { d: 'm9 17-5-5 5-5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
