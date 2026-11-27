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
		name: 'id-card-lanyard',
		size: 24,
		node: [
			['path', { d: 'M13.5 8h-3' }],
			['path', { d: 'm15 2-1 2h3a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2h3' }],
			['path', { d: 'M16 22a4 4 0 00-8 0' }],
			['path', { d: 'm9 2 3 6' }],
			['circle', { cx: '12', cy: '15', r: '3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
