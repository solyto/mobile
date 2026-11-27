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
		name: 'zodiac-scorpio',
		size: 24,
		node: [
			['path', { d: 'M10 19V5.5a1 1 0 0 1 5 0V17a2 2 0 0 0 2 2h5l-3-3' }],
			['path', { d: 'm22 19-3 3' }],
			['path', { d: 'M5 19V5.5a1 1 0 0 1 5 0' }],
			['path', { d: 'M5 5.5A2.5 2.5 0 0 0 2.5 3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
