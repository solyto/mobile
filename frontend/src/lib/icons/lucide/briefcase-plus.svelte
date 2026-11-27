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
		name: 'briefcase-plus',
		size: 24,
		node: [
			['path', { d: 'M13.354 20H4a2 2 0 01-2-2V8a2 2 0 012-2h16a2 2 0 012 2v3.354' }],
			['path', { d: 'M16 11.354V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v16' }],
			['path', { d: 'M16 17h6' }],
			['path', { d: 'M19 14v6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
