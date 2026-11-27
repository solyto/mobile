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
		name: 'circle-power',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '12', r: '10' }],
			['path', { d: 'M12 7v4' }],
			['path', { d: 'M7.998 9.003a5 5 0 1 0 8-.005' }]
		],
		aliases: ['power-circle']
	};
</script>

<Icon {...props} icon={iconData} />
