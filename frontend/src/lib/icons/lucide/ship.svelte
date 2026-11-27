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
		name: 'ship',
		size: 24,
		node: [
			['path', { d: 'M12 2v2' }],
			['path', { d: 'M12 9.189V13' }],
			['path', { d: 'M19 12V6a2 2 0 00-2-2H7a2 2 0 00-2 2v6' }],
			['path', { d: 'M19.38 19A11.6 11.6 0 0021 13l-8.188-3.639a2 2 0 00-1.624 0L3 13.001a11.6 11.6 0 002.81 7.76' }],
			['path', { d: 'M2 20c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
