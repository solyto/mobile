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
		name: 'git-commit-horizontal',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '12', r: '3' }],
			['line', { x1: '3', x2: '9', y1: '12', y2: '12' }],
			['line', { x1: '15', x2: '21', y1: '12', y2: '12' }]
		],
		aliases: ['git-commit']
	};
</script>

<Icon {...props} icon={iconData} />
