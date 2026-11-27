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
		name: 'zodiac-pisces',
		size: 24,
		node: [
			['path', { d: 'M19 21a15 15 0 0 1 0-18' }],
			['path', { d: 'M20 12H4' }],
			['path', { d: 'M5 3a15 15 0 0 1 0 18' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
