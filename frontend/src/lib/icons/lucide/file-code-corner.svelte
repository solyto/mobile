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
		name: 'file-code-corner',
		size: 24,
		node: [
			['path', { d: 'M4 12.15V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-3.35' }],
			['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
			['path', { d: 'm5 16-3 3 3 3' }],
			['path', { d: 'm9 22 3-3-3-3' }]
		],
		aliases: ['file-code-2']
	};
</script>

<Icon {...props} icon={iconData} />
