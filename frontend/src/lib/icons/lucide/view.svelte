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
		name: 'view',
		size: 24,
		node: [
			['path', { d: 'M21 17v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2' }],
			['path', { d: 'M21 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2' }],
			['circle', { cx: '12', cy: '12', r: '1' }],
			['path', { d: 'M18.944 12.33a1 1 0 0 0 0-.66 7.5 7.5 0 0 0-13.888 0 1 1 0 0 0 0 .66 7.5 7.5 0 0 0 13.888 0' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
