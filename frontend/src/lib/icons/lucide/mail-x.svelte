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
		name: 'mail-x',
		size: 24,
		node: [
			['path', { d: 'M22 12.532V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8.792' }],
			['path', { d: 'm22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7' }],
			['path', { d: 'm16.5 16.5 5 5' }],
			['path', { d: 'm21.5 16.5-5 5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
