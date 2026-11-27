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
		name: 'mic-off',
		size: 24,
		node: [
			['path', { d: 'M12 19v3' }],
			['path', { d: 'M15 9.34V5a3 3 0 0 0-5.68-1.33' }],
			['path', { d: 'M16.95 16.95A7 7 0 0 1 5 12v-2' }],
			['path', { d: 'M18.89 13.23A7 7 0 0 0 19 12v-2' }],
			['path', { d: 'm2 2 20 20' }],
			['path', { d: 'M9 9v3a3 3 0 0 0 5.12 2.12' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
