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
		name: 'monitor-dot',
		size: 24,
		node: [
			['path', { d: 'M12 17v4' }],
			['path', { d: 'M22 12.307V15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8.693' }],
			['path', { d: 'M8 21h8' }],
			['circle', { cx: '19', cy: '6', r: '3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
