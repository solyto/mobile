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
		name: 'disc-3',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '12', r: '10' }],
			['path', { d: 'M6 12c0-1.7.7-3.2 1.8-4.2' }],
			['circle', { cx: '12', cy: '12', r: '2' }],
			['path', { d: 'M18 12c0 1.7-.7 3.2-1.8 4.2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
