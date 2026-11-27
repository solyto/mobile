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
		name: 'wind-arrow-up',
		size: 24,
		node: [
			['path', { d: 'M10 2v8' }],
			['path', { d: 'M12.8 21.6A2 2 0 1 0 14 18H2' }],
			['path', { d: 'M17.5 10a2.5 2.5 0 1 1 2 4H2' }],
			['path', { d: 'm6 6 4 -4 4 4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
