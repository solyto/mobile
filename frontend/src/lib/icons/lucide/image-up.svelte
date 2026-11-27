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
		name: 'image-up',
		size: 24,
		node: [
			['path', { d: 'M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21' }],
			['path', { d: 'm14 19.5 3-3 3 3' }],
			['path', { d: 'M17 22v-5.5' }],
			['circle', { cx: '9', cy: '9', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
