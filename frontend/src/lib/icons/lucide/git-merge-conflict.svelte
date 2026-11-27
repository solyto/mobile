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
		name: 'git-merge-conflict',
		size: 24,
		node: [
			['path', { d: 'M12 6h4a2 2 0 0 1 2 2v7' }],
			['path', { d: 'M6 12v9' }],
			['path', { d: 'm8.5 3.5-5 5' }],
			['path', { d: 'm8.5 8.5-5-5' }],
			['circle', { cx: '18', cy: '18', r: '3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
