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
		name: 'mouse-left',
		size: 24,
		node: [
			['path', { d: 'M12 7.318V10' }],
			['path', { d: 'M5 10v5a7 7 0 0 0 14 0V9c0-3.527-2.608-6.515-6-7' }],
			['circle', { cx: '7', cy: '4', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
