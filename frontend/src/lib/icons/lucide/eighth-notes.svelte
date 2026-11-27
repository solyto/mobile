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
		name: 'eighth-notes',
		size: 24,
		node: [
			['path', { d: 'M21 16V3a1 1 0 0 0-1.28-.96l-10 2.917a1 1 0 0 0-.72.96V19' }],
			['circle', { cx: '18', cy: '16', r: '3' }],
			['circle', { cx: '6', cy: '19', r: '3' }]
		],
		aliases: ['music']
	};
</script>

<Icon {...props} icon={iconData} />
