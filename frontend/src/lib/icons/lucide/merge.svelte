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
		name: 'merge',
		size: 24,
		node: [
			['path', { d: 'm8 6 4-4 4 4' }],
			['path', { d: 'M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22' }],
			['path', { d: 'm20 22-5-5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
