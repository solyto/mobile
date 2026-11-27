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
		name: 'file-search',
		size: 24,
		node: [
			['path', { d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z' }],
			['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
			['circle', { cx: '11.5', cy: '14.5', r: '2.5' }],
			['path', { d: 'M13.3 16.3 15 18' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
