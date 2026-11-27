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
		name: 'arrow-up-right',
		size: 24,
		node: [
			['path', { d: 'M7 7h10v10' }],
			['path', { d: 'M7 17 17 7' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
