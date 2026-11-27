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
		name: 'git-pull-request-closed',
		size: 24,
		node: [
			['path', { d: 'm15.5 3.5 5 5' }],
			['path', { d: 'm15.5 8.5 5-5' }],
			['path', { d: 'M18 11.62V15' }],
			['path', { d: 'M6 9v12' }],
			['circle', { cx: '18', cy: '18', r: '3' }],
			['circle', { cx: '6', cy: '6', r: '3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
