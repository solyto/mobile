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
		name: 'volleyball',
		size: 24,
		node: [
			['path', { d: 'M11 7a16 16 20 0 1 10.98 4.362' }],
			['path', { d: 'M12 12a13 13 0 0 1-8.66 5' }],
			['path', { d: 'M16.83 13.634a16 16 0 0 1-9.267 7.328' }],
			['path', { d: 'M20.66 17A13 13 0 0 0 12 12a13 13 0 0 1 0-10' }],
			['path', { d: 'M8.17 15.366a16 16 0 0 1-1.713-11.69' }],
			['circle', { cx: '12', cy: '12', r: '10' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
