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
		name: 'panda',
		size: 24,
		node: [
			['path', { d: 'M11.25 17.25h1.5L12 18z' }],
			['path', { d: 'm15 12 2 2' }],
			['path', { d: 'M17.902 6.599a8 8 0 0 0-.5-.5' }],
			['path', { d: 'M2 14.5C2 19.47 6.48 22 12 22s10-2.53 10-7.5a10 10 0 0 0-1.3-4.83 4.5 4.5 0 1 0-7.05-5.5 8 8 0 0 0-3.3 0 4.5 4.5 0 1 0-7.04 5.5A10 10 0 0 0 2 14.5' }],
			['path', { d: 'M6.099 6.599a8 8 0 0 1 .5-.5' }],
			['path', { d: 'm9 12-2 2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
