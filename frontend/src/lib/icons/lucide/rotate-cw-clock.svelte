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
		name: 'rotate-cw-clock',
		size: 24,
		node: [
			['path', { d: 'M12 7v5l4 2' }],
			['path', { d: 'M16 8h5V3' }],
			['path', { d: 'm21 8-2.3-2.3A9.7 9.7 0 0012 3a9 9 0 109 9' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
