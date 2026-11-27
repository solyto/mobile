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
		name: 'move-up',
		size: 24,
		node: [
			['path', { d: 'M8 6L12 2L16 6' }],
			['path', { d: 'M12 2V22' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
