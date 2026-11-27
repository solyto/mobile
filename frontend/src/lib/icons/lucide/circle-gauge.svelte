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
		name: 'circle-gauge',
		size: 24,
		node: [
			['path', { d: 'M15.6 2.7a10 10 0 1 0 5.7 5.7' }],
			['circle', { cx: '12', cy: '12', r: '2' }],
			['path', { d: 'M13.4 10.6 19 5' }]
		],
		aliases: ['gauge-circle']
	};
</script>

<Icon {...props} icon={iconData} />
