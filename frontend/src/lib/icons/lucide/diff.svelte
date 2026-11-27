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
		name: 'diff',
		size: 24,
		node: [
			['path', { d: 'M12 3v14' }],
			['path', { d: 'M5 10h14' }],
			['path', { d: 'M5 21h14' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
