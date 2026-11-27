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
		name: 'half-note',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '18', r: '4' }],
			['path', { d: 'M16 18V2' }]
		],
		aliases: ['music-3']
	};
</script>

<Icon {...props} icon={iconData} />
