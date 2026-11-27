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
		name: 'user-round-group',
		size: 24,
		node: [
			['path', { d: 'M17 21a5 5 0 00-10 0' }],
			['path', { d: 'M22 10.5a3.5 3.5 0 00-5.507-2.868' }],
			['path', { d: 'M7.507 7.632A3.5 3.5 0 002 10.5' }],
			['circle', { cx: '12', cy: '13', r: '3' }],
			['circle', { cx: '18.5', cy: '4.5', r: '2.5' }],
			['circle', { cx: '5.5', cy: '4.5', r: '2.5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
