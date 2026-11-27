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
		name: 'audio-lines-x',
		size: 24,
		node: [
			['path', { d: 'M10 3v18' }],
			['path', { d: 'M14 8v6.35' }],
			['path', { d: 'm17 17 5 5' }],
			['path', { d: 'M18 5v8.1' }],
			['path', { d: 'M2 10v3' }],
			['path', { d: 'M22 10v3' }],
			['path', { d: 'm22 17-5 5' }],
			['path', { d: 'M6 6v11' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
