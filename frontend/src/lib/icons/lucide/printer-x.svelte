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
		name: 'printer-x',
		size: 24,
		node: [
			['path', { d: 'M12.531 22H7a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h6.377' }],
			['path', { d: 'm16.5 16.5 5 5' }],
			['path', { d: 'm16.5 21.5 5-5' }],
			['path', { d: 'M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1.5' }],
			['path', { d: 'M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
