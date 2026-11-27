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
		name: 'park',
		size: 24,
		node: [
			['path', { d: 'M12 18h10' }],
			['path', { d: 'M13.248 9.998A4.5 4.5 0 0 0 11.75 8.6V8a1 1 0 0 0-7.5 0 4.9 4.9 0 0 0 2.25 9H8' }],
			['path', { d: 'm15 14-2 6' }],
			['path', { d: 'm19 14 2 6' }],
			['path', { d: 'M21 14h-8' }],
			['path', { d: 'M8 20v-5.922a2 2 0 0 0-.586-1.414L6.5 11.75' }],
			['path', { d: 'M9.205 12.795 8 14' }],
			['circle', { cx: '19', cy: '6', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
