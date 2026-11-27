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
		name: 'zodiac-cancer',
		size: 24,
		node: [
			['path', { d: 'M21 14.5A9 6.5 0 0 1 5.5 19' }],
			['path', { d: 'M3 9.5A9 6.5 0 0 1 18.5 5' }],
			['circle', { cx: '17.5', cy: '14.5', r: '3.5' }],
			['circle', { cx: '6.5', cy: '9.5', r: '3.5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
