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
		name: 'banknote',
		size: 24,
		node: [
			['rect', { width: '20', height: '12', x: '2', y: '6', rx: '2' }],
			['circle', { cx: '12', cy: '12', r: '2' }],
			['path', { d: 'M6 12h.01M18 12h.01' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
