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
		name: 'credit-card-check',
		size: 24,
		node: [
			['path', { d: 'M12.5 19H4a2 2 0 01-2-2V7a2 2 0 012-2h16a2 2 0 012 2v4' }],
			['path', { d: 'M2 10h20' }],
			['path', { d: 'M6 14h2' }],
			['path', { d: 'm16 17 2 2 4-4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
