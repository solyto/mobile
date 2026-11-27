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
		name: 'check-check',
		size: 24,
		node: [
			['path', { d: 'M18 6 7 17l-5-5' }],
			['path', { d: 'm22 10-7.5 7.5L13 16' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
