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
		name: 'indian-rupee',
		size: 24,
		node: [
			['path', { d: 'M6 3h12' }],
			['path', { d: 'M6 8h12' }],
			['path', { d: 'm6 13 8.5 8' }],
			['path', { d: 'M6 13h3' }],
			['path', { d: 'M9 13c6.667 0 6.667-10 0-10' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
