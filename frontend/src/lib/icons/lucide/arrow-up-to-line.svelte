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
		name: 'arrow-up-to-line',
		size: 24,
		node: [
			['path', { d: 'M5 3h14' }],
			['path', { d: 'm18 13-6-6-6 6' }],
			['path', { d: 'M12 7v14' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
