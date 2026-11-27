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
		name: 'asterisk',
		size: 24,
		node: [
			['path', { d: 'M12 5v14' }],
			['path', { d: 'm18.065 8.496-12.125 7' }],
			['path', { d: 'm5.94 8.504 12.125 7' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
