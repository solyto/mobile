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
		name: 'x',
		size: 24,
		node: [
			['path', { d: 'M18 6 6 18' }],
			['path', { d: 'm6 6 12 12' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
