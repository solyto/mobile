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
		name: 'waypoints',
		size: 24,
		node: [
			['path', { d: 'm10.586 5.414-5.172 5.172' }],
			['path', { d: 'm18.586 13.414-5.172 5.172' }],
			['path', { d: 'M6 12h12' }],
			['circle', { cx: '12', cy: '20', r: '2' }],
			['circle', { cx: '12', cy: '4', r: '2' }],
			['circle', { cx: '20', cy: '12', r: '2' }],
			['circle', { cx: '4', cy: '12', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
