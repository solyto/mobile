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
		name: 'align-start-horizontal',
		size: 24,
		node: [
			['rect', { width: '6', height: '16', x: '4', y: '6', rx: '2' }],
			['rect', { width: '6', height: '9', x: '14', y: '6', rx: '2' }],
			['path', { d: 'M22 2H2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
