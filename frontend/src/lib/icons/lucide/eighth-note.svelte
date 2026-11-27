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
		name: 'eighth-note',
		size: 24,
		node: [
			['path', { d: 'm19 6-5.2-3.9a.5.5 0 0 0-.8.4V18' }],
			['circle', { cx: '9', cy: '18', r: '4' }]
		],
		aliases: ['music-2']
	};
</script>

<Icon {...props} icon={iconData} />
