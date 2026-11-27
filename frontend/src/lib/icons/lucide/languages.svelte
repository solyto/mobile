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
		name: 'languages',
		size: 24,
		node: [
			['path', { d: 'm5 8 6 6' }],
			['path', { d: 'm4 14 6-6 2-3' }],
			['path', { d: 'M2 5h12' }],
			['path', { d: 'M7 2h1' }],
			['path', { d: 'm22 22-5-10-5 10' }],
			['path', { d: 'M14 18h6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
