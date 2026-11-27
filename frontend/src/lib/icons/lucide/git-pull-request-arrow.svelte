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
		name: 'git-pull-request-arrow',
		size: 24,
		node: [
			['circle', { cx: '5', cy: '6', r: '3' }],
			['path', { d: 'M5 9v12' }],
			['circle', { cx: '19', cy: '18', r: '3' }],
			['path', { d: 'm15 9-3-3 3-3' }],
			['path', { d: 'M12 6h5a2 2 0 0 1 2 2v7' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
