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
		name: 'users-collaboration',
		size: 24,
		node: [
			['path', { d: 'M12.925 3.047a9 9 0 017.616 6.11' }],
			['path', { d: 'M13 22a2 2 0 012-2h4a2 2 0 012 2' }],
			['path', { d: 'M3 12a2 2 0 012-2h4a2 2 0 012 2' }],
			['path', { d: 'M3.889 15.9a9 9 0 005.247 4.632' }],
			['circle', { cx: '17', cy: '14', r: '2' }],
			['circle', { cx: '7', cy: '4', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
