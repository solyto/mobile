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
		name: 'bangladeshi-taka',
		size: 24,
		node: [
			['path', { d: 'M6 5a2 2 0 0 1 4 0v12a4 4 0 0 0 8 0 2 2 0 0 0-4 0' }],
			['path', { d: 'M6 9h12' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
