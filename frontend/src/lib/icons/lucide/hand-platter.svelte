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
		name: 'hand-platter',
		size: 24,
		node: [
			['path', { d: 'M12 3V2' }],
			['path', { d: 'm15.4 17.4 3.2-2.8a2 2 0 1 1 2.8 2.9l-3.6 3.3c-.7.8-1.7 1.2-2.8 1.2h-4c-1.1 0-2.1-.4-2.8-1.2l-1.302-1.464A1 1 0 0 0 6.151 19H5' }],
			['path', { d: 'M2 14h12a2 2 0 0 1 0 4h-2' }],
			['path', { d: 'M4 10h16' }],
			['path', { d: 'M5 10a7 7 0 0 1 14 0' }],
			['path', { d: 'M5 14v6a1 1 0 0 1-1 1H2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
