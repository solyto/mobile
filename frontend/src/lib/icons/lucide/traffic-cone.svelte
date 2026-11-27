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
		name: 'traffic-cone',
		size: 24,
		node: [
			['path', { d: 'M16.05 10.966a5 2.5 0 0 1-8.1 0' }],
			['path', { d: 'm16.923 14.049 4.48 2.04a1 1 0 0 1 .001 1.831l-8.574 3.9a2 2 0 0 1-1.66 0l-8.574-3.91a1 1 0 0 1 0-1.83l4.484-2.04' }],
			['path', { d: 'M16.949 14.14a5 2.5 0 1 1-9.9 0L10.063 3.5a2 2 0 0 1 3.874 0z' }],
			['path', { d: 'M9.194 6.57a5 2.5 0 0 0 5.61 0' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
