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
		name: 'list-restart',
		size: 24,
		node: [
			['path', { d: 'M21 5H3' }],
			['path', { d: 'M7 12H3' }],
			['path', { d: 'M7 19H3' }],
			['path', { d: 'M12 18a5 5 0 0 0 9-3 4.5 4.5 0 0 0-4.5-4.5c-1.33 0-2.54.54-3.41 1.41L11 14' }],
			['path', { d: 'M11 10v4h4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
