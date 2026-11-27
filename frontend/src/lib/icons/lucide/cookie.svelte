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
		name: 'cookie',
		size: 24,
		node: [
			['path', { d: 'M11 17h.01' }],
			['path', { d: 'M11.496 2c.324-.016.558.292.529.615a4 4 0 004.235 4.368.713.713 0 01.758.757 4 4 0 004.366 4.237c.323-.03.63.204.614.527a10 10 0 01-2.915 6.566A1 1 0 114.93 4.918 10 10 0 0111.496 2' }],
			['path', { d: 'M12 12h.01' }],
			['path', { d: 'M16 16h.01' }],
			['path', { d: 'M16 3h.01' }],
			['path', { d: 'M21 4h.01' }],
			['path', { d: 'M21 8h.01' }],
			['path', { d: 'M7 14h.01' }],
			['path', { d: 'M9 8h.01' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
