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
		name: 'code',
		size: 24,
		node: [
			['path', { d: 'm16 18 6-6-6-6' }],
			['path', { d: 'm8 6-6 6 6 6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
