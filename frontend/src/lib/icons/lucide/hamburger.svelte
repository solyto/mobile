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
		name: 'hamburger',
		size: 24,
		node: [
			['path', { d: 'M12 16H4a2 2 0 1 1 0-4h16a2 2 0 1 1 0 4h-4.25' }],
			['path', { d: 'M5 12a2 2 0 0 1-2-2 9 7 0 0 1 18 0 2 2 0 0 1-2 2' }],
			['path', { d: 'M5 16a2 2 0 0 0-2 2 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 2 2 0 0 0-2-2q0 0 0 0' }],
			['path', { d: 'm6.67 12 6.13 4.6a2 2 0 0 0 2.8-.4l3.15-4.2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
