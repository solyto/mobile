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
		name: 'germ',
		size: 24,
		node: [
			['path', { d: 'm11 2 .925 1.848' }],
			['path', { d: 'M13 15h.01' }],
			['path', { d: 'm16 21-1-2.472' }],
			['path', { d: 'm19 2-1 1.804' }],
			['path', { d: 'm2 19 2.746-1.373' }],
			['path', { d: 'm22 16-2.474-2.13' }],
			['path', { d: 'm22 5-1.804 1' }],
			['path', { d: 'm3 10 2 2' }],
			['path', { d: 'M9 16h.01' }],
			['path', { d: 'M9 20v2' }],
			['path', { d: 'M9.33 7.035c-.51 1.478-1.786 2.93-3.09 3.794A5 5 0 009 20a12.1 12.1 0 0011.902-9.916A6 6 0 009.33 7.035' }],
			['circle', { cx: '15', cy: '9', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
