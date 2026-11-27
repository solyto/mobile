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
		name: 'eye-closed',
		size: 24,
		node: [
			['path', { d: 'm15 18-.722-3.25' }],
			['path', { d: 'M2 8a10.645 10.645 0 0 0 20 0' }],
			['path', { d: 'm20 15-1.726-2.05' }],
			['path', { d: 'm4 15 1.726-2.05' }],
			['path', { d: 'm9 18 .722-3.25' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
