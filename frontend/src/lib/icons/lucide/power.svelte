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
		name: 'power',
		size: 24,
		node: [
			['path', { d: 'M12 2v10' }],
			['path', { d: 'M18.4 6.6a9 9 0 1 1-12.77.04' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
