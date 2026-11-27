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
		name: 'folder-git-2',
		size: 24,
		node: [
			['path', { d: 'M18 19a5 5 0 0 1-5-5v8' }],
			['path', { d: 'M9 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v5' }],
			['circle', { cx: '13', cy: '12', r: '2' }],
			['circle', { cx: '20', cy: '19', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
