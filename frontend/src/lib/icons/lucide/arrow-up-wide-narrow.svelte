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
		name: 'arrow-up-wide-narrow',
		size: 24,
		node: [
			['path', { d: 'm3 8 4-4 4 4' }],
			['path', { d: 'M7 4v16' }],
			['path', { d: 'M11 12h10' }],
			['path', { d: 'M11 16h7' }],
			['path', { d: 'M11 20h4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
