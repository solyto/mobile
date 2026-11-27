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
		name: 'zodiac-sagittarius',
		size: 24,
		node: [
			['path', { d: 'M15 3h6v6' }],
			['path', { d: 'M21 3 3 21' }],
			['path', { d: 'm9 9 6 6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
