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
		name: 'venetian-mask',
		size: 24,
		node: [
			['path', { d: 'M18 11c-1.5 0-2.5.5-3 2' }],
			['path', { d: 'M4 6a2 2 0 0 0-2 2v4a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5V8a2 2 0 0 0-2-2h-3a8 8 0 0 0-5 2 8 8 0 0 0-5-2z' }],
			['path', { d: 'M6 11c1.5 0 2.5.5 3 2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
