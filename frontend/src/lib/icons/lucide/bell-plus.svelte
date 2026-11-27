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
		name: 'bell-plus',
		size: 24,
		node: [
			['path', { d: 'M10.268 21a2 2 0 0 0 3.464 0' }],
			['path', { d: 'M15 8h6' }],
			['path', { d: 'M18 5v6' }],
			['path', { d: 'M20.002 14.464a9 9 0 0 0 .738.863A1 1 0 0 1 20 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 8.75-5.332' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
