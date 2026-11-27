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
		name: 'share',
		size: 24,
		node: [
			['path', { d: 'M12 2v13' }],
			['path', { d: 'm16 6-4-4-4 4' }],
			['path', { d: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
