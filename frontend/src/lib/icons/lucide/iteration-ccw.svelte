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
		name: 'iteration-ccw',
		size: 24,
		node: [
			['path', { d: 'm16 14 4 4-4 4' }],
			['path', { d: 'M20 10a8 8 0 1 0-8 8h8' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
