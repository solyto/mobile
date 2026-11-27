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
		name: 'test-tubes',
		size: 24,
		node: [
			['path', { d: 'M9 2v17.5A2.5 2.5 0 0 1 6.5 22A2.5 2.5 0 0 1 4 19.5V2' }],
			['path', { d: 'M20 2v17.5a2.5 2.5 0 0 1-2.5 2.5a2.5 2.5 0 0 1-2.5-2.5V2' }],
			['path', { d: 'M3 2h7' }],
			['path', { d: 'M14 2h7' }],
			['path', { d: 'M9 16H4' }],
			['path', { d: 'M20 16h-5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
