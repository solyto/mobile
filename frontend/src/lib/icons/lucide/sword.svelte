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
		name: 'sword',
		size: 24,
		node: [
			['path', { d: 'm11 19-6-6' }],
			['path', { d: 'm5 21-2-2' }],
			['path', { d: 'm8 16-4 4' }],
			['path', { d: 'M9.5 17.5 20.414 6.586A2 2 0 0021 5.172V3h-2.172a2 2 0 00-1.414.586L6.5 14.5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
