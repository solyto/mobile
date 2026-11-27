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
		name: 'tally-3',
		size: 24,
		node: [
			['path', { d: 'M4 4v16' }],
			['path', { d: 'M9 4v16' }],
			['path', { d: 'M14 4v16' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
