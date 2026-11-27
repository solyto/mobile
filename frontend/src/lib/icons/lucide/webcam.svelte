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
		name: 'webcam',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '10', r: '8' }],
			['circle', { cx: '12', cy: '10', r: '3' }],
			['path', { d: 'M7 22h10' }],
			['path', { d: 'M12 22v-4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
