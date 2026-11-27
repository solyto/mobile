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
		name: 'accessibility',
		size: 24,
		node: [
			['circle', { cx: '16', cy: '4', r: '1' }],
			['path', { d: 'm18 19 1-7-6 1' }],
			['path', { d: 'm5 8 3-3 5.5 3-2.36 3.5' }],
			['path', { d: 'M4.24 14.5a5 5 0 0 0 6.88 6' }],
			['path', { d: 'M13.76 17.5a5 5 0 0 0-6.88-6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
