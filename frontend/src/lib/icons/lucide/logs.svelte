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
		name: 'logs',
		size: 24,
		node: [
			['path', { d: 'M3 5h1' }],
			['path', { d: 'M3 12h1' }],
			['path', { d: 'M3 19h1' }],
			['path', { d: 'M8 5h1' }],
			['path', { d: 'M8 12h1' }],
			['path', { d: 'M8 19h1' }],
			['path', { d: 'M13 5h8' }],
			['path', { d: 'M13 12h8' }],
			['path', { d: 'M13 19h8' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
