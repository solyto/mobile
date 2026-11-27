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
		name: 'russian-ruble',
		size: 24,
		node: [
			['path', { d: 'M6 11h8a4 4 0 0 0 0-8H9v18' }],
			['path', { d: 'M6 15h8' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
