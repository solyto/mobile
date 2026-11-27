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
		name: 'face-expressionless',
		size: 24,
		node: [
			['path', { d: 'M14 10h2' }],
			['path', { d: 'M8 10h2' }],
			['path', { d: 'M8 16h8' }],
			['circle', { cx: '12', cy: '12', r: '10' }]
		],
		aliases: ['annoyed']
	};
</script>

<Icon {...props} icon={iconData} />
