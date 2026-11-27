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
		name: 'loader-pinwheel',
		size: 24,
		node: [
			['path', { d: 'M22 12a1 1 0 0 1-10 0 1 1 0 0 0-10 0' }],
			['path', { d: 'M7 20.7a1 1 0 1 1 5-8.7 1 1 0 1 0 5-8.6' }],
			['path', { d: 'M7 3.3a1 1 0 1 1 5 8.6 1 1 0 1 0 5 8.6' }],
			['circle', { cx: '12', cy: '12', r: '10' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
