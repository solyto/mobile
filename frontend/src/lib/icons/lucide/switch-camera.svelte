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
		name: 'switch-camera',
		size: 24,
		node: [
			['path', { d: 'M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5' }],
			['path', { d: 'M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5' }],
			['circle', { cx: '12', cy: '12', r: '3' }],
			['path', { d: 'm18 22-3-3 3-3' }],
			['path', { d: 'm6 2 3 3-3 3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
