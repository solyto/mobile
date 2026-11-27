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
		name: 'list',
		size: 24,
		node: [
			['path', { d: 'M3 5h.01' }],
			['path', { d: 'M3 12h.01' }],
			['path', { d: 'M3 19h.01' }],
			['path', { d: 'M8 5h13' }],
			['path', { d: 'M8 12h13' }],
			['path', { d: 'M8 19h13' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
