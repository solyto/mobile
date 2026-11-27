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
		name: 'layers-arrow-down',
		size: 24,
		node: [
			['path', { d: 'M12 7v15' }],
			['path', { d: 'M2 12a1 1 0 00.58.91l5.093 2.316' }],
			['path', { d: 'M22 12a1 1 0 01-.59.92l-5.077 2.308' }],
			['path', { d: 'M8 10.37 2.6 7.91a1 1 0 010-1.831l8.57-3.9a2 2 0 011.66.001l8.59 3.91a1 1 0 010 1.831l-5.392 2.45' }],
			['path', { d: 'm9 19 3 3 3-3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
