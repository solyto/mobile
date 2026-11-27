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
		name: 'text-initial',
		size: 24,
		node: [
			['path', { d: 'M15 5h6' }],
			['path', { d: 'M15 12h6' }],
			['path', { d: 'M3 19h18' }],
			['path', { d: 'm3 12 3.553-7.724a.5.5 0 0 1 .894 0L11 12' }],
			['path', { d: 'M3.92 10h6.16' }]
		],
		aliases: ['letter-text']
	};
</script>

<Icon {...props} icon={iconData} />
