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
		name: 'arrow-up-from-dot',
		size: 24,
		node: [
			['path', { d: 'm5 9 7-7 7 7' }],
			['path', { d: 'M12 16V2' }],
			['circle', { cx: '12', cy: '21', r: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
