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
		name: 'git-branch-plus',
		size: 24,
		node: [
			['path', { d: 'M6 3v12' }],
			['path', { d: 'M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' }],
			['path', { d: 'M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' }],
			['path', { d: 'M15 6a9 9 0 0 0-9 9' }],
			['path', { d: 'M18 15v6' }],
			['path', { d: 'M21 18h-6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
