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
		name: 'coins',
		size: 24,
		node: [
			['path', { d: 'M13.744 17.736a6 6 0 1 1-7.48-7.48' }],
			['path', { d: 'M15 6h1v4' }],
			['path', { d: 'm6.134 14.768.866-.5 2 3.464' }],
			['circle', { cx: '16', cy: '8', r: '6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
