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
		name: 'bluetooth-off',
		size: 24,
		node: [
			['path', { d: 'm17 17-5 5V12l-5 5' }],
			['path', { d: 'm2 2 20 20' }],
			['path', { d: 'M14.5 9.5 17 7l-5-5v4.5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
