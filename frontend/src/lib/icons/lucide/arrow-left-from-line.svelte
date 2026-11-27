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
		name: 'arrow-left-from-line',
		size: 24,
		node: [
			['path', { d: 'm9 6-6 6 6 6' }],
			['path', { d: 'M3 12h14' }],
			['path', { d: 'M21 19V5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
