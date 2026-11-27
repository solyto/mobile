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
		name: 'search-alert',
		size: 24,
		node: [
			['circle', { cx: '11', cy: '11', r: '8' }],
			['path', { d: 'm21 21-4.3-4.3' }],
			['path', { d: 'M11 7v4' }],
			['path', { d: 'M11 15h.01' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
