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
		name: 'circle-user',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '12', r: '10' }],
			['circle', { cx: '12', cy: '10', r: '3' }],
			['path', { d: 'M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662' }]
		],
		aliases: ['user-circle']
	};
</script>

<Icon {...props} icon={iconData} />
