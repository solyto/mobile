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
		name: 'crop',
		size: 24,
		node: [
			['path', { d: 'M6 2v14a2 2 0 0 0 2 2h14' }],
			['path', { d: 'M18 22V8a2 2 0 0 0-2-2H2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
