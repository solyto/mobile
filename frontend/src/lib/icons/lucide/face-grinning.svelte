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
		name: 'face-grinning',
		size: 24,
		node: [
			['path', { d: 'M15 10V9' }],
			['path', { d: 'M7.084 14.302a5.12 5.12 0 009.833 0 .24.24 0 00-.235-.302H7.32a.24.24 0 00-.235.302' }],
			['path', { d: 'M9 10V9' }],
			['circle', { cx: '12', cy: '12', r: '10' }]
		],
		aliases: ['laugh']
	};
</script>

<Icon {...props} icon={iconData} />
