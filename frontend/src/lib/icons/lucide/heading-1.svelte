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
		name: 'heading-1',
		size: 24,
		node: [
			['path', { d: 'M4 12h8' }],
			['path', { d: 'M4 18V6' }],
			['path', { d: 'M12 18V6' }],
			['path', { d: 'm17 12 3-2v8' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
