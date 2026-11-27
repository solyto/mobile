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
		name: 'user-search',
		size: 24,
		node: [
			['circle', { cx: '10', cy: '7', r: '4' }],
			['path', { d: 'M10.3 15H7a4 4 0 0 0-4 4v2' }],
			['circle', { cx: '17', cy: '17', r: '3' }],
			['path', { d: 'm21 21-1.9-1.9' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
