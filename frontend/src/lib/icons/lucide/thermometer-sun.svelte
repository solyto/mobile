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
		name: 'thermometer-sun',
		size: 24,
		node: [
			['path', { d: 'M12 2v2' }],
			['path', { d: 'M12 8a4 4 0 0 0-1.645 7.647' }],
			['path', { d: 'M2 12h2' }],
			['path', { d: 'M20 14.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z' }],
			['path', { d: 'm4.93 4.93 1.41 1.41' }],
			['path', { d: 'm6.34 17.66-1.41 1.41' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
