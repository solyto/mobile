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
		name: 'trailer',
		size: 24,
		node: [
			['path', { d: 'M10 11.341V10' }],
			['path', { d: 'M14 13v-3' }],
			['path', { d: 'M18 17V8a2 2 0 00-2-2H4a2 2 0 00-2 2v7a2 2 0 002 2h2' }],
			['path', { d: 'M22 15v1a1 1 0 01-1 1H10' }],
			['path', { d: 'M6 11.341V10' }],
			['circle', { cx: '8', cy: '17', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
