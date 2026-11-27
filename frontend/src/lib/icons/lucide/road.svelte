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
		name: 'road',
		size: 24,
		node: [
			['path', { d: 'M12 17v4' }],
			['path', { d: 'M12 5V3' }],
			['path', { d: 'M12 9v3' }],
			['path', { d: 'M2.077 18.449A2 2 0 0 0 4 21h16a2 2 0 0 0 1.924-2.55l-4-14A2 2 0 0 0 16 3H8a2 2 0 0 0-1.924 1.45z' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
