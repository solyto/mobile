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
		name: 'text-wrap',
		size: 24,
		node: [
			['path', { d: 'm16 16-3 3 3 3' }],
			['path', { d: 'M3 12h14.5a1 1 0 0 1 0 7H13' }],
			['path', { d: 'M3 19h6' }],
			['path', { d: 'M3 5h18' }]
		],
		aliases: ['wrap-text']
	};
</script>

<Icon {...props} icon={iconData} />
