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
		name: 'user-key',
		size: 24,
		node: [
			['path', { d: 'M20 11v6' }],
			['path', { d: 'M20 13h2' }],
			['path', { d: 'M3 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 2.072.578' }],
			['circle', { cx: '10', cy: '7', r: '4' }],
			['circle', { cx: '20', cy: '19', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
