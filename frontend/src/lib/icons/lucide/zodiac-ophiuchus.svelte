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
		name: 'zodiac-ophiuchus',
		size: 24,
		node: [
			['path', { d: 'M3 10A6.06 6.06 0 0 1 12 10 A6.06 6.06 0 0 0 21 10' }],
			['path', { d: 'M6 3v12a6 6 0 0 0 12 0V3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
