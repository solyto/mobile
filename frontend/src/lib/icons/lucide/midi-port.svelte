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
		name: 'midi-port',
		size: 24,
		node: [
			['path', { d: 'M12 18h.01' }],
			['path', { d: 'M15 2.458V5a1 1 0 01-1 1h-4a1 1 0 01-1-1V2.458' }],
			['path', { d: 'M16 16h.01' }],
			['path', { d: 'M18 12h.01' }],
			['path', { d: 'M6 12h.01' }],
			['path', { d: 'M8 16h.01' }],
			['circle', { cx: '12', cy: '12', r: '10' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
