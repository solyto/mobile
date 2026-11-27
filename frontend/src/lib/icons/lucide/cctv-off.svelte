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
		name: 'cctv-off',
		size: 24,
		node: [
			['path', { d: 'm12.309 6.652 4.797 2.401a1 1 0 0 1 .447 1.341l-.501 1.001.605.605h2.725a1 1 0 0 1 .894 1.447l-.724 1.448' }],
			['path', { d: 'm15.166 15.166-.719 1.439a1 1 0 0 1-1.342.447L3.61 12.3a2.92 2.92 0 0 1-1.3-3.91L3.69 5.6a2.9 2.9 0 0 1 .873-1.037' }],
			['path', { d: 'M2 19h3.76a2 2 0 0 0 1.8-1.1l1.441-2.902' }],
			['path', { d: 'm2 2 20 20' }],
			['path', { d: 'M2 21v-4' }],
			['path', { d: 'M7 9h.01' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
