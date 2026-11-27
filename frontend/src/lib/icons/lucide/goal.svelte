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
		name: 'goal',
		size: 24,
		node: [
			['path', { d: 'M12 13V2l8 4-8 4' }],
			['path', { d: 'M20.561 10.222a9 9 0 1 1-12.55-5.29' }],
			['path', { d: 'M8.002 9.997a5 5 0 1 0 8.9 2.02' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
