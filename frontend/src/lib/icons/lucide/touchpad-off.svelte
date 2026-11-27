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
		name: 'touchpad-off',
		size: 24,
		node: [
			['path', { d: 'M12 20v-6' }],
			['path', { d: 'M19.656 14H22' }],
			['path', { d: 'M2 14h12' }],
			['path', { d: 'm2 2 20 20' }],
			['path', { d: 'M20 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2' }],
			['path', { d: 'M9.656 4H20a2 2 0 0 1 2 2v10.344' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
