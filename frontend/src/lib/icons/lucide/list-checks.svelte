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
		name: 'list-checks',
		size: 24,
		node: [
			['path', { d: 'M13 5h8' }],
			['path', { d: 'M13 12h8' }],
			['path', { d: 'M13 19h8' }],
			['path', { d: 'm3 17 2 2 4-4' }],
			['path', { d: 'm3 7 2 2 4-4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
