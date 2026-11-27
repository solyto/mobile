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
		name: 'locate-off',
		size: 24,
		node: [
			['path', { d: 'M12 19v3' }],
			['path', { d: 'M12 2v3' }],
			['path', { d: 'M18.89 13.24a7 7 0 0 0-8.13-8.13' }],
			['path', { d: 'M19 12h3' }],
			['path', { d: 'M2 12h3' }],
			['path', { d: 'm2 2 20 20' }],
			['path', { d: 'M7.05 7.05a7 7 0 0 0 9.9 9.9' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
