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
		name: 'credit-card-minus',
		size: 24,
		node: [
			['path', { d: 'M22 13V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2h8.536' }],
			['path', { d: 'M22 10H2' }],
			['path', { d: 'M6 14h2' }],
			['path', { d: 'M16 17h6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
