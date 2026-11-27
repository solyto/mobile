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
		name: 'arrow-down-to-dot',
		size: 24,
		node: [
			['path', { d: 'M12 2v14' }],
			['path', { d: 'm19 9-7 7-7-7' }],
			['circle', { cx: '12', cy: '21', r: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
