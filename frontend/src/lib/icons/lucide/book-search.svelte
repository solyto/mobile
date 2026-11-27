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
		name: 'book-search',
		size: 24,
		node: [
			['path', { d: 'M11 22H5.5a1 1 0 0 1 0-5h4.501' }],
			['path', { d: 'm21 22-1.879-1.878' }],
			['path', { d: 'M3 19.5v-15A2.5 2.5 0 0 1 5.5 2H18a1 1 0 0 1 1 1v8' }],
			['circle', { cx: '17', cy: '18', r: '3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
