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
		name: 'users-round',
		size: 24,
		node: [
			['path', { d: 'M18 21a8 8 0 0 0-16 0' }],
			['circle', { cx: '10', cy: '8', r: '5' }],
			['path', { d: 'M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3' }]
		],
		aliases: ['users-2']
	};
</script>

<Icon {...props} icon={iconData} />
