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
		name: 'calendar-fold',
		size: 24,
		node: [
			['path', { d: 'M16 2v3' }],
			['path', { d: 'M21 15V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h10v-5a1 1 0 011-1za2.4 2.4 0 01-.706 1.706l-3.588 3.588A2.4 2.4 0 0115 21' }],
			['path', { d: 'M3 9h18' }],
			['path', { d: 'M8 2v3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
