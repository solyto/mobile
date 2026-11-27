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
		name: 'beaker',
		size: 24,
		node: [
			['path', { d: 'M4.5 3h15' }],
			['path', { d: 'M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3' }],
			['path', { d: 'M6 14h12' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
