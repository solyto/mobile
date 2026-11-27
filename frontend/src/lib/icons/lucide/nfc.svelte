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
		name: 'nfc',
		size: 24,
		node: [
			['path', { d: 'M6 8.32a7.43 7.43 0 0 1 0 7.36' }],
			['path', { d: 'M9.46 6.21a11.76 11.76 0 0 1 0 11.58' }],
			['path', { d: 'M12.91 4.1a15.91 15.91 0 0 1 .01 15.8' }],
			['path', { d: 'M16.37 2a20.16 20.16 0 0 1 0 20' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
