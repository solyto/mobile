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
		name: 'heading-4',
		size: 24,
		node: [
			['path', { d: 'M12 18V6' }],
			['path', { d: 'M17 10v3a1 1 0 0 0 1 1h3' }],
			['path', { d: 'M21 10v8' }],
			['path', { d: 'M4 12h8' }],
			['path', { d: 'M4 18V6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
