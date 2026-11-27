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
		name: 'line-style',
		size: 24,
		node: [
			['path', { d: 'M11 5h2' }],
			['path', { d: 'M15 12h6' }],
			['path', { d: 'M19 5h2' }],
			['path', { d: 'M3 12h6' }],
			['path', { d: 'M3 19h18' }],
			['path', { d: 'M3 5h2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
