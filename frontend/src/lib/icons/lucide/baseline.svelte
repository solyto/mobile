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
		name: 'baseline',
		size: 24,
		node: [
			['path', { d: 'M4 20h16' }],
			['path', { d: 'm6 16 6-12 6 12' }],
			['path', { d: 'M8 12h8' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
