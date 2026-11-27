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
		name: 'theater',
		size: 24,
		node: [
			['path', { d: 'M2 10s3-3 3-8' }],
			['path', { d: 'M22 10s-3-3-3-8' }],
			['path', { d: 'M10 2c0 4.4-3.6 8-8 8' }],
			['path', { d: 'M14 2c0 4.4 3.6 8 8 8' }],
			['path', { d: 'M2 10s2 2 2 5' }],
			['path', { d: 'M22 10s-2 2-2 5' }],
			['path', { d: 'M8 15h8' }],
			['path', { d: 'M2 22v-1a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1' }],
			['path', { d: 'M14 22v-1a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
