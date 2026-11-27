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
		name: 'metronome',
		size: 24,
		node: [
			['path', { d: 'M12 11.4V9.1' }],
			['path', { d: 'm12 17 6.59-6.59' }],
			['path', { d: 'm15.05 5.7-.218-.691a3 3 0 0 0-5.663 0L4.418 19.695A1 1 0 0 0 5.37 21h13.253a1 1 0 0 0 .951-1.31L18.45 16.2' }],
			['circle', { cx: '20', cy: '9', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
