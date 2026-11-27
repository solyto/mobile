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
		name: 'smartphone-nfc',
		size: 24,
		node: [
			['rect', { width: '7', height: '12', x: '2', y: '6', rx: '1' }],
			['path', { d: 'M13 8.32a7.43 7.43 0 0 1 0 7.36' }],
			['path', { d: 'M16.46 6.21a11.76 11.76 0 0 1 0 11.58' }],
			['path', { d: 'M19.91 4.1a15.91 15.91 0 0 1 .01 15.8' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
