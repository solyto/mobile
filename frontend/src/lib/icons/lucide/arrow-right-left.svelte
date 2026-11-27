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
		name: 'arrow-right-left',
		size: 24,
		node: [
			['path', { d: 'm16 3 4 4-4 4' }],
			['path', { d: 'M20 7H4' }],
			['path', { d: 'm8 21-4-4 4-4' }],
			['path', { d: 'M4 17h16' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
