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
		name: 'tic-tac-toe',
		size: 24,
		node: [
			['path', { d: 'M12 2v20' }],
			['path', { d: 'm21 16-5 5' }],
			['path', { d: 'm21 21-5-5' }],
			['path', { d: 'M22 12H2' }],
			['path', { d: 'M8 3 3 8' }],
			['path', { d: 'M8 8 3 3' }],
			['circle', { cx: '18.5', cy: '5.5', r: '2.5' }],
			['circle', { cx: '5.5', cy: '18.5', r: '2.5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
