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
		name: 'tablets',
		size: 24,
		node: [
			['circle', { cx: '7', cy: '7', r: '5' }],
			['circle', { cx: '17', cy: '17', r: '5' }],
			['path', { d: 'M12 17h10' }],
			['path', { d: 'm3.46 10.54 7.08-7.08' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
