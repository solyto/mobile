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
		name: 'ham',
		size: 24,
		node: [
			['path', { d: 'M13.144 21.144A7.274 10.445 45 1 0 2.856 10.856' }],
			['path', { d: 'M13.144 21.144A7.274 4.365 45 0 0 2.856 10.856a7.274 4.365 45 0 0 10.288 10.288' }],
			['path', { d: 'M16.565 10.435 18.6 8.4a2.501 2.501 0 1 0 1.65-4.65 2.5 2.5 0 1 0-4.66 1.66l-2.024 2.025' }],
			['path', { d: 'm8.5 16.5-1-1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
