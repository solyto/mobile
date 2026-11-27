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
		name: 'squares-subtract',
		size: 24,
		node: [
			['path', { d: 'M10 22a2 2 0 0 1-2-2' }],
			['path', { d: 'M16 22h-2' }],
			['path', { d: 'M16 4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-5a2 2 0 0 1 2-2h5a1 1 0 0 0 1-1z' }],
			['path', { d: 'M20 8a2 2 0 0 1 2 2' }],
			['path', { d: 'M22 14v2' }],
			['path', { d: 'M22 20a2 2 0 0 1-2 2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
