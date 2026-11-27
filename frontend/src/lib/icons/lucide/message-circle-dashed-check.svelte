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
		name: 'message-circle-dashed-check',
		size: 24,
		node: [
			['path', { d: 'M10.1 2.182a10 10 0 013.8 0' }],
			['path', { d: 'M13.9 21.818a10 10 0 01-3.8 0' }],
			['path', { d: 'M17.609 3.72a10 10 0 012.69 2.7' }],
			['path', { d: 'M2.182 13.9a10 10 0 010-3.8' }],
			['path', { d: 'M20.28 17.61a10 10 0 01-2.7 2.69' }],
			['path', { d: 'M21.818 10.1a10 10 0 010 3.8' }],
			['path', { d: 'M3.721 6.391a10 10 0 012.7-2.69' }],
			['path', { d: 'm6.163 21.117-2.906.85a1 1 0 01-1.236-1.169l.965-2.98' }],
			['path', { d: 'm16 9-5.5 5.5L8 12' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
