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
		name: 'lollipop',
		size: 24,
		node: [
			['circle', { cx: '11', cy: '11', r: '8' }],
			['path', { d: 'm21 21-4.3-4.3' }],
			['path', { d: 'M11 11a2 2 0 0 0 4 0 4 4 0 0 0-8 0 6 6 0 0 0 12 0' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
