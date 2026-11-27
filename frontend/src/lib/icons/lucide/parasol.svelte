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
		name: 'parasol',
		size: 24,
		node: [
			['path', { d: 'M12.5 11.134 18.196 21' }],
			['path', { d: 'M20.425 5.299a10 10 0 0 0-16.941 9.78c.183.563.843.774 1.355.478L20.16 6.711c.512-.296.66-.973.264-1.413' }],
			['path', { d: 'M21 21H3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
