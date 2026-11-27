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
		name: 'arrow-down-narrow-wide',
		size: 24,
		node: [
			['path', { d: 'm3 16 4 4 4-4' }],
			['path', { d: 'M7 20V4' }],
			['path', { d: 'M11 4h4' }],
			['path', { d: 'M11 8h7' }],
			['path', { d: 'M11 12h10' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
