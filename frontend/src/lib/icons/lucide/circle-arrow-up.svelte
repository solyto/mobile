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
		name: 'circle-arrow-up',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '12', r: '10' }],
			['path', { d: 'm16 12-4-4-4 4' }],
			['path', { d: 'M12 16V8' }]
		],
		aliases: ['arrow-up-circle']
	};
</script>

<Icon {...props} icon={iconData} />
