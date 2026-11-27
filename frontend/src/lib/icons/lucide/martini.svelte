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
		name: 'martini',
		size: 24,
		node: [
			['path', { d: 'M12 12 4.207 4.207A.707.707 0 0 1 4.707 3h14.586a.707.707 0 0 1 .5 1.207z' }],
			['path', { d: 'M12 12v10' }],
			['path', { d: 'M7 22h10' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
