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
		name: 'layer-arrow-up',
		size: 24,
		node: [
			['path', { d: 'M12 14V4' }],
			['path', { d: 'M7.674 10.774 2.58 13.09a1 1 0 000 1.822l8.6 3.91a2 2 0 001.65 0l8.58-3.9a1 1 0 00.59-.92 1 1 0 00-.59-.922l-5.078-2.308' }],
			['path', { d: 'm9 7 3-3 3 3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
