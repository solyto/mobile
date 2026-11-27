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
		name: 'triangles-centerline-dashed-vertical',
		size: 24,
		node: [
			['path', { d: 'M12 14v2' }],
			['path', { d: 'M12 20v2' }],
			['path', { d: 'M12 2v2' }],
			['path', { d: 'M12 8v2' }],
			['path', { d: 'M20.288 16.703A1 1 0 0022 16V8a1 1 0 00-1.712-.703l-3.99 3.991a1 1 0 00-.001 1.424z' }],
			['path', { d: 'M3.712 16.703A1 1 0 012 16V8a1 1 0 011.712-.703l3.99 3.991a1 1 0 01.001 1.424z' }]
		],
		aliases: ['flip-vertical-2']
	};
</script>

<Icon {...props} icon={iconData} />
