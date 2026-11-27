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
		name: 'radio-tower',
		size: 24,
		node: [
			['path', { d: 'M4.9 16.1C1 12.2 1 5.8 4.9 1.9' }],
			['path', { d: 'M7.8 4.7a6.14 6.14 0 0 0-.8 7.5' }],
			['circle', { cx: '12', cy: '9', r: '2' }],
			['path', { d: 'M16.2 4.8c2 2 2.26 5.11.8 7.47' }],
			['path', { d: 'M19.1 1.9a9.96 9.96 0 0 1 0 14.1' }],
			['path', { d: 'M9.5 18h5' }],
			['path', { d: 'm8 22 4-11 4 11' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
