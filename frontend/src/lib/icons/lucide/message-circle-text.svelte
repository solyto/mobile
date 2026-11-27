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
		name: 'message-circle-text',
		size: 24,
		node: [
			['path', { d: 'M3.086 17.509a2 2 0 00-.094-1.167 10 10 0 114.777 4.719 2 2 0 00-1.099-.092l-3.413.998a1 1 0 01-1.236-1.168z' }],
			['path', { d: 'M8 12h9' }],
			['path', { d: 'M8 16h5' }],
			['path', { d: 'M8 8h7' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
