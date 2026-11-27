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
		name: 'train-front',
		size: 24,
		node: [
			['path', { d: 'M8 3.1V7a4 4 0 0 0 8 0V3.1' }],
			['path', { d: 'm9 15-1-1' }],
			['path', { d: 'm15 15 1-1' }],
			['path', { d: 'M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z' }],
			['path', { d: 'm8 19-2 3' }],
			['path', { d: 'm16 19 2 3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
