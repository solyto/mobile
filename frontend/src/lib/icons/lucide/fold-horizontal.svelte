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
		name: 'fold-horizontal',
		size: 24,
		node: [
			['path', { d: 'M2 12h6' }],
			['path', { d: 'M22 12h-6' }],
			['path', { d: 'M12 2v2' }],
			['path', { d: 'M12 8v2' }],
			['path', { d: 'M12 14v2' }],
			['path', { d: 'M12 20v2' }],
			['path', { d: 'm19 9-3 3 3 3' }],
			['path', { d: 'm5 15 3-3-3-3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
