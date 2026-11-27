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
		name: 'arrow-down-right',
		size: 24,
		node: [
			['path', { d: 'm7 7 10 10' }],
			['path', { d: 'M17 7v10H7' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
