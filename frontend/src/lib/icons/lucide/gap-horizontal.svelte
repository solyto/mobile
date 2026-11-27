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
		name: 'gap-horizontal',
		size: 24,
		node: [
			['path', { d: 'M12 2v2' }],
			['path', { d: 'M12 8v2' }],
			['path', { d: 'M12 14v2' }],
			['path', { d: 'M12 20v2' }],
			['path', { d: 'M21 3h-3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3' }],
			['path', { d: 'M3 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
