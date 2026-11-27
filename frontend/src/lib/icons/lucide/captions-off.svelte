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
		name: 'captions-off',
		size: 24,
		node: [
			['path', { d: 'M10.5 5H19a2 2 0 0 1 2 2v8.5' }],
			['path', { d: 'M17 11h-.5' }],
			['path', { d: 'M19 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2' }],
			['path', { d: 'm2 2 20 20' }],
			['path', { d: 'M7 11h4' }],
			['path', { d: 'M7 15h2.5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
