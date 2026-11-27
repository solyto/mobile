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
		name: 'haze',
		size: 24,
		node: [
			['path', { d: 'm5.2 6.2 1.4 1.4' }],
			['path', { d: 'M2 13h2' }],
			['path', { d: 'M20 13h2' }],
			['path', { d: 'm17.4 7.6 1.4-1.4' }],
			['path', { d: 'M22 17H2' }],
			['path', { d: 'M22 21H2' }],
			['path', { d: 'M16 13a4 4 0 0 0-8 0' }],
			['path', { d: 'M12 5V2.5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
