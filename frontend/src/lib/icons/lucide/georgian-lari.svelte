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
		name: 'georgian-lari',
		size: 24,
		node: [
			['path', { d: 'M11.5 21a7.5 7.5 0 1 1 7.35-9' }],
			['path', { d: 'M13 12V3' }],
			['path', { d: 'M4 21h16' }],
			['path', { d: 'M9 12V3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
