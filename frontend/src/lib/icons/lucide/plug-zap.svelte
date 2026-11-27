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
		name: 'plug-zap',
		size: 24,
		node: [
			['path', { d: 'M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z' }],
			['path', { d: 'm2 22 3-3' }],
			['path', { d: 'M7.5 13.5 10 11' }],
			['path', { d: 'M10.5 16.5 13 14' }],
			['path', { d: 'm18 3-4 4h6l-4 4' }]
		],
		aliases: ['plug-zap-2']
	};
</script>

<Icon {...props} icon={iconData} />
