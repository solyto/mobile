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
		name: 'shrub',
		size: 24,
		node: [
			['path', { d: 'M12 22v-5.172a2 2 0 0 0-.586-1.414L9.5 13.5' }],
			['path', { d: 'M14.5 14.5 12 17' }],
			['path', { d: 'M17 8.8A6 6 0 0 1 13.8 20H10A6.5 6.5 0 0 1 7 8a5 5 0 0 1 10 0z' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
