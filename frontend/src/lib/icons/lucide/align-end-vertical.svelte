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
		name: 'align-end-vertical',
		size: 24,
		node: [
			['rect', { width: '16', height: '6', x: '2', y: '4', rx: '2' }],
			['rect', { width: '9', height: '6', x: '9', y: '14', rx: '2' }],
			['path', { d: 'M22 22V2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
