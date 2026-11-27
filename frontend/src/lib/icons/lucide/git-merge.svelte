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
		name: 'git-merge',
		size: 24,
		node: [
			['circle', { cx: '18', cy: '18', r: '3' }],
			['circle', { cx: '6', cy: '6', r: '3' }],
			['path', { d: 'M6 21V9a9 9 0 0 0 9 9' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
