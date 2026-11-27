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
		name: 'ban',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '12', r: '10' }],
			['path', { d: 'M4.929 4.929 19.07 19.071' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
