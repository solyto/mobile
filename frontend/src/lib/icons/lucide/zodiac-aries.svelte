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
		name: 'zodiac-aries',
		size: 24,
		node: [
			['path', { d: 'M12 7.5a4.5 4.5 0 1 1 5 4.5' }],
			['path', { d: 'M7 12a4.5 4.5 0 1 1 5-4.5V21' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
