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
		name: 'library',
		size: 24,
		node: [
			['path', { d: 'm16 6 4 14' }],
			['path', { d: 'M12 6v14' }],
			['path', { d: 'M8 8v12' }],
			['path', { d: 'M4 4v16' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
