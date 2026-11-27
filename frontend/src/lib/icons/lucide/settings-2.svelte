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
		name: 'settings-2',
		size: 24,
		node: [
			['path', { d: 'M14 17H5' }],
			['path', { d: 'M19 7h-9' }],
			['circle', { cx: '17', cy: '17', r: '3' }],
			['circle', { cx: '7', cy: '7', r: '3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
