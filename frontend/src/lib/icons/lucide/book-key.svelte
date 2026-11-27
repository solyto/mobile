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
		name: 'book-key',
		size: 24,
		node: [
			['path', { d: 'M13 2H6.5A2.5 2.5 0 0 0 4 4.5v15' }],
			['path', { d: 'M17 2v6' }],
			['path', { d: 'M17 4h2' }],
			['path', { d: 'M20 15.2V21a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20' }],
			['circle', { cx: '17', cy: '10', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
