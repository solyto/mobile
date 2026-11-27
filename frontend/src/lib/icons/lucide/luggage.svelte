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
		name: 'luggage',
		size: 24,
		node: [
			['path', { d: 'M6 20a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2' }],
			['path', { d: 'M8 18V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14' }],
			['path', { d: 'M10 20h4' }],
			['circle', { cx: '16', cy: '20', r: '2' }],
			['circle', { cx: '8', cy: '20', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
