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
		name: 'vector-polygon',
		size: 24,
		node: [
			['path', { d: 'm12.828 4.813 5.344 2.375' }],
			['path', { d: 'm15.769 18.153 3.461-8.306' }],
			['path', { d: 'm5.687 14.074 7.625 4.852' }],
			['path', { d: 'M9.772 5.579 5.228 11.42' }],
			['circle', { cx: '11', cy: '4', r: '2' }],
			['circle', { cx: '15', cy: '20', r: '2' }],
			['circle', { cx: '20', cy: '8', r: '2' }],
			['circle', { cx: '4', cy: '13', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
