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
		name: 'unfold-vertical',
		size: 24,
		node: [
			['path', { d: 'M12 22v-6' }],
			['path', { d: 'M12 8V2' }],
			['path', { d: 'M4 12H2' }],
			['path', { d: 'M10 12H8' }],
			['path', { d: 'M16 12h-2' }],
			['path', { d: 'M22 12h-2' }],
			['path', { d: 'm15 19-3 3-3-3' }],
			['path', { d: 'm15 5-3-3-3 3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
