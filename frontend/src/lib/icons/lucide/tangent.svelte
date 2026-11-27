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
		name: 'tangent',
		size: 24,
		node: [
			['circle', { cx: '17', cy: '4', r: '2' }],
			['path', { d: 'M15.59 5.41 5.41 15.59' }],
			['circle', { cx: '4', cy: '17', r: '2' }],
			['path', { d: 'M12 22s-4-9-1.5-11.5S22 12 22 12' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
