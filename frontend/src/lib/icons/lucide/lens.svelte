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
		name: 'lens',
		size: 24,
		node: [
			['path', { d: 'M15.725 7.296h.01' }],
			['path', { d: 'M6 12a6 6 0 016-6' }],
			['circle', { cx: '12', cy: '12', r: '10' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
