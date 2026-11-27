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
		name: 'git-graph',
		size: 24,
		node: [
			['circle', { cx: '5', cy: '6', r: '3' }],
			['path', { d: 'M5 9v6' }],
			['circle', { cx: '5', cy: '18', r: '3' }],
			['path', { d: 'M12 3v18' }],
			['circle', { cx: '19', cy: '6', r: '3' }],
			['path', { d: 'M16 15.7A9 9 0 0 0 19 9' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
