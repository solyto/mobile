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
		name: 'arrow-down-to-line',
		size: 24,
		node: [
			['path', { d: 'M12 17V3' }],
			['path', { d: 'm6 11 6 6 6-6' }],
			['path', { d: 'M19 21H5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
