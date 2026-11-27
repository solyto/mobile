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
		name: 'chevron-right',
		size: 24,
		node: [
			['path', { d: 'm9 18 6-6-6-6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
