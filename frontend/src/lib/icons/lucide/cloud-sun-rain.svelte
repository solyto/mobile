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
		name: 'cloud-sun-rain',
		size: 24,
		node: [
			['path', { d: 'M12 2v2' }],
			['path', { d: 'm4.93 4.93 1.41 1.41' }],
			['path', { d: 'M20 12h2' }],
			['path', { d: 'm19.07 4.93-1.41 1.41' }],
			['path', { d: 'M15.947 12.65a4 4 0 0 0-5.925-4.128' }],
			['path', { d: 'M3 20a5 5 0 1 1 8.9-4H13a3 3 0 0 1 2 5.24' }],
			['path', { d: 'M11 20v2' }],
			['path', { d: 'M7 19v2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
