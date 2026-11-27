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
		name: 'mouth-off',
		size: 24,
		node: [
			['path', { d: 'M13.074 7.417a2.6 2.6 0 012.989.099c1.829 1.36 3.053 2.076 5.479 3.644a1 1 0 01.308 1.368 11.6 11.6 0 01-1.617 2.05' }],
			['path', { d: 'M2 12a50.5 50.5 0 0010.99.99' }],
			['path', { d: 'm2 2 20 20' }],
			['path', { d: 'M21 11a1 1 0 011 1 51 51 0 01-3.734.61' }],
			['path', { d: 'M7.695 7.695c-1.7 1.247-2.92 1.967-5.238 3.464a1 1 0 00-.307 1.369 11.6 11.6 0 0014.766 4.388' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
