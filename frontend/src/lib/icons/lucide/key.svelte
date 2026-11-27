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
		name: 'key',
		size: 24,
		node: [
			['path', { d: 'm2 21 9.6-9.6' }],
			['path', { d: 'm7.5 15.5 2.3 2.3a1 1 0 0 1 0 1.4l-2.1 2.1a1 1 0 0 1-1.4 0L4 19' }],
			['circle', { cx: '15.5', cy: '7.5', r: '5.5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
