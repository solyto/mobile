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
		name: 'regex',
		size: 24,
		node: [
			['path', { d: 'M17 3v10' }],
			['path', { d: 'm12.67 5.5 8.66 5' }],
			['path', { d: 'm12.67 10.5 8.66-5' }],
			['path', { d: 'M9 17a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2z' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
