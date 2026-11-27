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
		name: 'arrow-left-right',
		size: 24,
		node: [
			['path', { d: 'M8 3 4 7l4 4' }],
			['path', { d: 'M4 7h16' }],
			['path', { d: 'm16 21 4-4-4-4' }],
			['path', { d: 'M20 17H4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
