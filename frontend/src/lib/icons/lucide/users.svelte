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
		name: 'users',
		size: 24,
		node: [
			['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }],
			['path', { d: 'M16 3.128a4 4 0 0 1 0 7.744' }],
			['path', { d: 'M22 21v-2a4 4 0 0 0-3-3.87' }],
			['circle', { cx: '9', cy: '7', r: '4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
