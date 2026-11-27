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
		name: 'germ-off',
		size: 24,
		node: [
			['path', { d: 'm11 2 .925 1.848' }],
			['path', { d: 'M13 15h.01' }],
			['path', { d: 'M13.424 7.768a2 2 0 112.808 2.808' }],
			['path', { d: 'm16 21-1-2.472' }],
			['path', { d: 'M16.988 16.988A12 12 0 019 20a5 5 0 01-2.759-9.171 8.8 8.8 0 002.307-2.28' }],
			['path', { d: 'm19 2-1 1.804' }],
			['path', { d: 'm2 19 2.746-1.373' }],
			['path', { d: 'm2 2 20 20' }],
			['path', { d: 'm22 16-2.474-2.13a12 12 0 001.376-3.786 6 6 0 00-10.313-5.151' }],
			['path', { d: 'm22 5-1.804 1' }],
			['path', { d: 'm3 10 2 2' }],
			['path', { d: 'M9 16h.01' }],
			['path', { d: 'M9 20v2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
