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
		name: 'zodiac-virgo',
		size: 24,
		node: [
			['path', { d: 'M11 5.5a1 1 0 0 1 5 0V16a5 5 0 0 0 5 5' }],
			['path', { d: 'M16 11.5a1 1 0 0 1 5 0V16a5 5 0 0 1-5 5' }],
			['path', { d: 'M6 19V6a3 3 0 0 0-3-3h0' }],
			['path', { d: 'M6 5.5a1 1 0 0 1 5 0V19' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
