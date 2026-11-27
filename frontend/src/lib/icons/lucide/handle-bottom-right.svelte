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
		name: 'handle-bottom-right',
		size: 24,
		node: [
			['path', { d: 'M21 8 8 21' }],
			['path', { d: 'm21 15-6 6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
