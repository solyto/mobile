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
		name: 'zodiac-gemini',
		size: 24,
		node: [
			['path', { d: 'M16 4.525v14.948' }],
			['path', { d: 'M20 3A17 17 0 0 1 4 3' }],
			['path', { d: 'M4 21a17 17 0 0 1 16 0' }],
			['path', { d: 'M8 4.525v14.948' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
