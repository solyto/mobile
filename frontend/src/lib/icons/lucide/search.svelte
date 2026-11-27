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
		name: 'search',
		size: 24,
		node: [
			['path', { d: 'm21 21-4.34-4.34' }],
			['circle', { cx: '11', cy: '11', r: '8' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
