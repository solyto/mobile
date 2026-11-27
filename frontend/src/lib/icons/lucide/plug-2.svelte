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
		name: 'plug-2',
		size: 24,
		node: [
			['path', { d: 'M9 2v6' }],
			['path', { d: 'M15 2v6' }],
			['path', { d: 'M12 17v5' }],
			['path', { d: 'M5 8h14' }],
			['path', { d: 'M6 11V8h12v3a6 6 0 1 1-12 0Z' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
