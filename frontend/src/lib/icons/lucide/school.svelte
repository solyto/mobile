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
		name: 'school',
		size: 24,
		node: [
			['path', { d: 'M14 21v-3a2 2 0 0 0-4 0v3' }],
			['path', { d: 'M18 4.933V21' }],
			['path', { d: 'm4 6 7.106-3.79a2 2 0 0 1 1.788 0L20 6' }],
			['path', { d: 'm6 11-3.52 2.147a1 1 0 0 0-.48.854V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a1 1 0 0 0-.48-.853L18 11' }],
			['path', { d: 'M6 4.933V21' }],
			['circle', { cx: '12', cy: '9', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
