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
		name: 'test-tube',
		size: 24,
		node: [
			['path', { d: 'M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5c-1.4 0-2.5-1.1-2.5-2.5V2' }],
			['path', { d: 'M8.5 2h7' }],
			['path', { d: 'M14.5 16h-5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
