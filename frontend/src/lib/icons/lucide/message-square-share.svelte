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
		name: 'message-square-share',
		size: 24,
		node: [
			['path', { d: 'M12 3H4a2 2 0 0 0-2 2v16.286a.71.71 0 0 0 1.212.502l2.202-2.202A2 2 0 0 1 6.828 19H20a2 2 0 0 0 2-2v-4' }],
			['path', { d: 'M16 3h6v6' }],
			['path', { d: 'm16 9 6-6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
