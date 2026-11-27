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
		name: 'mouse-off',
		size: 24,
		node: [
			['path', { d: 'M12 6v.343' }],
			['path', { d: 'M18.218 18.218A7 7 0 0 1 5 15V9a7 7 0 0 1 .782-3.218' }],
			['path', { d: 'M19 13.343V9A7 7 0 0 0 8.56 2.902' }],
			['path', { d: 'M22 22 2 2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
