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
		name: 'maximize-2',
		size: 24,
		node: [
			['path', { d: 'M15 3h6v6' }],
			['path', { d: 'm21 3-7 7' }],
			['path', { d: 'm3 21 7-7' }],
			['path', { d: 'M9 21H3v-6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
