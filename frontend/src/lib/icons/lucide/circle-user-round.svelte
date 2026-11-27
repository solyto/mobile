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
		name: 'circle-user-round',
		size: 24,
		node: [
			['path', { d: 'M17.925 20.056a6 6 0 0 0-11.851.001' }],
			['circle', { cx: '12', cy: '11', r: '4' }],
			['circle', { cx: '12', cy: '12', r: '10' }]
		],
		aliases: ['user-circle-2']
	};
</script>

<Icon {...props} icon={iconData} />
