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
		name: 'slash',
		size: 24,
		node: [
			['path', { d: 'M22 2 2 22' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
