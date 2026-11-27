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
		name: 'type',
		size: 24,
		node: [
			['path', { d: 'M12 4v16' }],
			['path', { d: 'M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2' }],
			['path', { d: 'M9 20h6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
