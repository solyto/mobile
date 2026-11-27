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
		name: 'usb-c-port',
		size: 24,
		node: [
			['path', { d: 'M6 12h12' }],
			['rect', { x: '2', y: '8', width: '20', height: '8', rx: '4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
