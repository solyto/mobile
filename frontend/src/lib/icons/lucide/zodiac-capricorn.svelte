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
		name: 'zodiac-capricorn',
		size: 24,
		node: [
			['path', { d: 'M11 21a3 3 0 0 0 3-3V6.5a1 1 0 0 0-7 0' }],
			['path', { d: 'M7 19V6a3 3 0 0 0-3-3h0' }],
			['circle', { cx: '17', cy: '17', r: '3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
