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
		name: 'pocket-knife',
		size: 24,
		node: [
			['path', { d: 'M3 2v1c0 1 2 1 2 2S3 6 3 7s2 1 2 2-2 1-2 2 2 1 2 2' }],
			['path', { d: 'M18 6h.01' }],
			['path', { d: 'M6 18h.01' }],
			['path', { d: 'M20.83 8.83a4 4 0 0 0-5.66-5.66l-12 12a4 4 0 1 0 5.66 5.66Z' }],
			['path', { d: 'M18 11.66V22a4 4 0 0 0 4-4V6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
