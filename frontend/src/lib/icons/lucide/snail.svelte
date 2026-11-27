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
		name: 'snail',
		size: 24,
		node: [
			['path', { d: 'M2 13a6 6 0 1 0 12 0 4 4 0 1 0-8 0 2 2 0 0 0 4 0' }],
			['circle', { cx: '10', cy: '13', r: '8' }],
			['path', { d: 'M2 21h12c4.4 0 8-3.6 8-8V7a2 2 0 1 0-4 0v6' }],
			['path', { d: 'M18 3 19.1 5.2' }],
			['path', { d: 'M22 3 20.9 5.2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
