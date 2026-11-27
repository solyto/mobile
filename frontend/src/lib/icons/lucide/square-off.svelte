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
		name: 'square-off',
		size: 24,
		node: [
			['path', { d: 'M20.4 20.4a2 2 0 01-1.4.6H5a2 2 0 01-2-2V5a2 2 0 01.59-1.41' }],
			['path', { d: 'M21 15.3V5a2 2 0 00-2-2H8.7' }],
			['path', { d: 'M22 22 2 2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
