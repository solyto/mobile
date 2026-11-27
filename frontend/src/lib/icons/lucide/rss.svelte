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
		name: 'rss',
		size: 24,
		node: [
			['path', { d: 'M4 11a9 9 0 0 1 9 9' }],
			['path', { d: 'M4 4a16 16 0 0 1 16 16' }],
			['circle', { cx: '5', cy: '19', r: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
