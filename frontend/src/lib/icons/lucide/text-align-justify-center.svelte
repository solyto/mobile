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
		name: 'text-align-justify-center',
		size: 24,
		node: [
			['path', { d: 'M3 5h18' }],
			['path', { d: 'M3 12h18' }],
			['path', { d: 'M7 19h10' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
