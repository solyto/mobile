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
		name: 'line-dot-bottom-vertical',
		size: 24,
		node: [
			['path', { d: 'M12 3v12' }],
			['circle', { cx: '12', cy: '18', r: '3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
