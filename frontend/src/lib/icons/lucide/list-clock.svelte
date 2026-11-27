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
		name: 'list-clock',
		size: 24,
		node: [
			['path', { d: 'M16 13v2.2l1.6 1' }],
			['path', { d: 'M3 12h3.458' }],
			['path', { d: 'M3 19h3.832' }],
			['path', { d: 'M3 5h18' }],
			['circle', { cx: '16', cy: '15', r: '6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
