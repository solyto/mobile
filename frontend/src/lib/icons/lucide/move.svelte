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
		name: 'move',
		size: 24,
		node: [
			['path', { d: 'M12 2v20' }],
			['path', { d: 'm15 19-3 3-3-3' }],
			['path', { d: 'm19 9 3 3-3 3' }],
			['path', { d: 'M2 12h20' }],
			['path', { d: 'm5 9-3 3 3 3' }],
			['path', { d: 'm9 5 3-3 3 3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
