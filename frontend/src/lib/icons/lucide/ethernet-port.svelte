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
		name: 'ethernet-port',
		size: 24,
		node: [
			['path', { d: 'M10 8v1' }],
			['path', { d: 'M14 8v1' }],
			['path', { d: 'M18 8v1' }],
			['path', { d: 'M19 17a2 2 0 00-1.765 1.059l-.47.882A2 2 0 0115 20H9a2 2 0 01-1.765-1.059l-.47-.882A2 2 0 005 17H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v9a2 2 0 01-2 2z' }],
			['path', { d: 'M6 8v1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
