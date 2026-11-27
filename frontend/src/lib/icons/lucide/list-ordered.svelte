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
		name: 'list-ordered',
		size: 24,
		node: [
			['path', { d: 'M11 5h10' }],
			['path', { d: 'M11 12h10' }],
			['path', { d: 'M11 19h10' }],
			['path', { d: 'M4 4h1v5' }],
			['path', { d: 'M4 9h2' }],
			['path', { d: 'M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
