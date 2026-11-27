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
		name: 'mail-dot',
		size: 24,
		node: [
			['path', { d: 'M12.674 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4.675' }],
			['path', { d: 'm2 7 9 5.701a2 2 0 0 0 2 0l1.084-.686' }],
			['circle', { cx: '19', cy: '7', r: '3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
