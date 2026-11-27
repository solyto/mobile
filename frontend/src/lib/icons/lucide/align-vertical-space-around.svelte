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
		name: 'align-vertical-space-around',
		size: 24,
		node: [
			['rect', { width: '10', height: '6', x: '7', y: '9', rx: '2' }],
			['path', { d: 'M22 20H2' }],
			['path', { d: 'M22 4H2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
